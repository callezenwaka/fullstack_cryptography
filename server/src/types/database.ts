export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface EncryptedRequest {
  encryptedData: string;
  type: 'standard' | 'large';
}

export interface EncryptedResponse {
  encryptedResponse: string;
  type: 'standard' | 'large';
}

export interface HybridEncryptedData {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}