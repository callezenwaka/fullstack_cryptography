// types/transaction.ts - Improved types without 'any'

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  userId: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
}

// ✅ Clean API response type (no 'any')
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Alternative: Even more specific API response types
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// Union type for more precise error handling
export type ApiResult<T> = SuccessResponse<T> | ErrorResponse;

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

// ✅ Additional utility types for better type safety
export type TransactionStatus = Transaction['status'];
export type TransactionType = Transaction['type'];

// ✅ Update request type (for PATCH operations)
export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {
  // Can optionally update status in some cases
  status?: TransactionStatus;
}

// ✅ Query types for filtering/searching
export interface TransactionQuery {
  userId?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}