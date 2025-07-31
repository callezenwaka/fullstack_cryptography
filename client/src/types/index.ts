export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface EncryptedResponse {
  encryptedResponse: string | HybridEncryptedData;
  type: 'standard' | 'large';
}

export interface HybridEncryptedData {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
}

export interface EncryptionKeys {
  clientPrivate: CryptoKey;
  clientPublic: CryptoKey;
  serverPublic: CryptoKey;
}

export interface EncryptionStatus {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  keyFingerprints: {
    clientPublic: string;
    serverPublic: string;
  } | null;
}