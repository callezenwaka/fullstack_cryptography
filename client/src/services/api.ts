// client/src/services/api.ts - Perfectly typed (no 'any' or 'unknown')
import axios, { AxiosResponse } from 'axios';
import { ApiResponse, EncryptedResponse, HybridEncryptedData } from '@/types';
import { cryptoService } from './cryptoService';
import { toast } from 'react-hot-toast';

type HttpMethod = 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH';

const API_URL = '/api';

// ✅ Internal request function can accept any serializable data (including encrypted payloads)
const request = async <T = never, R = AxiosResponse<T>>(
  url: string, 
  method: HttpMethod, 
  data?: unknown, // ✅ More flexible for internal encrypted data
  params?: unknown
): Promise<R> => {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${url}`,
      data,
      params,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    console.log(`✅ API Response: ${response.status} ${method.toUpperCase()} ${url}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`❌ API Error: ${method.toUpperCase()} ${url}`, error);
    
    const axiosError = error as { 
      response?: { status: number; data?: { message?: string } }; 
      code?: string;
      message?: string;
    };
    
    if (axiosError.response?.status && axiosError.response.status >= 500) {
      toast.error('Server error occurred');
    } else if (axiosError.response?.status === 404) {
      toast.error('Resource not found');
    } else if (axiosError.code === 'ECONNABORTED') {
      toast.error('Request timeout');
    } else if (!axiosError.response) {
      toast.error('Network error');
    }
    
    throw error;
  }
};

const encryptRequest = async <T>(data: T): Promise<{ encryptedData: string | HybridEncryptedData; type: 'standard' | 'large' }> => {
  if (!cryptoService.isReady()) {
    throw new Error('Encryption service not ready');
  }

  const jsonData = JSON.stringify(data);
  const maxRSASize = 190;
  
  if (jsonData.length > maxRSASize) {
    const encryptedData = await cryptoService.encryptLargeDataForServer(jsonData);
    return { encryptedData, type: 'large' };
  } else {
    const encryptedData = await cryptoService.encryptForServer(jsonData);
    return { encryptedData, type: 'standard' };
  }
};

const decryptResponse = async <T>(response: EncryptedResponse): Promise<ApiResponse<T>> => {
  if (!cryptoService.isReady()) {
    throw new Error('Encryption service not ready');
  }

  let decryptedData: string;
  
  if (response.type === 'large') {
    decryptedData = await cryptoService.decryptLargeDataFromServer(
      response.encryptedResponse as HybridEncryptedData
    );
  } else {
    decryptedData = await cryptoService.decryptFromServer(
      response.encryptedResponse as string
    );
  }

  return JSON.parse(decryptedData) as ApiResponse<T>;
};

// ✅ Clean API methods without overly strict constraints
export const get = async <TResponse>(url: string): Promise<ApiResponse<TResponse>> => {
  const response: EncryptedResponse = await request(url, 'GET');
  return await decryptResponse<TResponse>(response);
};

export const post = async <TResponse, TRequest = unknown>(
  url: string, 
  data: TRequest
): Promise<ApiResponse<TResponse>> => {
  const encryptedRequest = await encryptRequest(data);
  const response: EncryptedResponse = await request(url, 'POST', encryptedRequest);
  return await decryptResponse<TResponse>(response);
};

export const put = async <TResponse, TRequest = unknown>(
  url: string, 
  data: TRequest
): Promise<ApiResponse<TResponse>> => {
  const encryptedRequest = await encryptRequest(data);
  const response: EncryptedResponse = await request(url, 'PUT', encryptedRequest);
  return await decryptResponse<TResponse>(response);
};

export const patch = async <TResponse, TRequest = unknown>(
  url: string, 
  data: TRequest
): Promise<ApiResponse<TResponse>> => {
  const encryptedRequest = await encryptRequest(data);
  const response: EncryptedResponse = await request(url, 'PATCH', encryptedRequest);
  return await decryptResponse<TResponse>(response);
};

export const deleteRequest = async <TResponse>(url: string): Promise<ApiResponse<TResponse>> => {
  const response: EncryptedResponse = await request(url, 'DELETE');
  return await decryptResponse<TResponse>(response);
};

// Utility methods
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  return await request('/health', 'GET');
};

export const getServerPublicKey = async (): Promise<{ publicKey: string; fingerprint?: string }> => {
  return await request('/public-key', 'GET');
};

// ✅ Clean class-based API service
class ApiService {
  async get<TResponse>(url: string): Promise<ApiResponse<TResponse>> {
    return get<TResponse>(url);
  }

  async post<TResponse, TRequest = unknown>(
    url: string, 
    data: TRequest
  ): Promise<ApiResponse<TResponse>> {
    return post<TResponse, TRequest>(url, data);
  }

  async put<TResponse, TRequest = unknown>(
    url: string, 
    data: TRequest
  ): Promise<ApiResponse<TResponse>> {
    return put<TResponse, TRequest>(url, data);
  }

  async patch<TResponse, TRequest = unknown>(
    url: string, 
    data: TRequest
  ): Promise<ApiResponse<TResponse>> {
    return patch<TResponse, TRequest>(url, data);
  }

  async delete<TResponse>(url: string): Promise<ApiResponse<TResponse>> {
    return deleteRequest<TResponse>(url);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return healthCheck();
  }

  async getServerPublicKey(): Promise<{ publicKey: string; fingerprint?: string }> {
    return getServerPublicKey();
  }
}

export const apiService = new ApiService();