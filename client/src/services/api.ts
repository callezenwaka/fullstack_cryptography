// client/src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, EncryptedResponse, HybridEncryptedData } from '@/types';
import { cryptoService } from './cryptoService';
import { toast } from 'react-hot-toast';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error);
        
        if (error.response?.status >= 500) {
          toast.error('Server error occurred');
        } else if (error.response?.status === 404) {
          toast.error('Resource not found');
        } else if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout');
        } else if (!error.response) {
          toast.error('Network error');
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async encryptRequest(data: any): Promise<{ encryptedData: string | HybridEncryptedData; type: 'standard' | 'large' }> {
    if (!cryptoService.isReady()) {
      throw new Error('Encryption service not ready');
    }

    const jsonData = JSON.stringify(data);
    
    // Check if data is too large for direct RSA encryption
    const maxRSASize = 190; // Conservative estimate for RSA-2048 with OAEP
    
    if (jsonData.length > maxRSASize) {
      const encryptedData = await cryptoService.encryptLargeDataForServer(jsonData);
      return { encryptedData, type: 'large' };
    } else {
      const encryptedData = await cryptoService.encryptForServer(jsonData);
      return { encryptedData, type: 'standard' };
    }
  }

  private async decryptResponse(response: EncryptedResponse): Promise<any> {
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

    return JSON.parse(decryptedData);
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<EncryptedResponse> = await this.client.get(url);
      return await this.decryptResponse(response.data);
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const encryptedRequest = await this.encryptRequest(data);
      const response: AxiosResponse<EncryptedResponse> = await this.client.post(url, encryptedRequest);
      return await this.decryptResponse(response.data);
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const encryptedRequest = await this.encryptRequest(data);
      const response: AxiosResponse<EncryptedResponse> = await this.client.put(url, encryptedRequest);
      return await this.decryptResponse(response.data);
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<EncryptedResponse> = await this.client.delete(url);
      return await this.decryptResponse(response.data);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }

  // Health check (unencrypted)
  async healthCheck(): Promise<any> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Get server public key (unencrypted)
  async getServerPublicKey(): Promise<{ publicKey: string; fingerprint?: string }> {
    try {
      const response = await this.client.get('/public-key');
      return response.data;
    } catch (error) {
      console.error('Failed to get server public key:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();