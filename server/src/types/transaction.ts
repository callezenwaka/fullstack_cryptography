export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  userId: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
}

export interface UpdateTransactionRequest {
  amount?: number;
  description?: string;
  status?: 'pending' | 'completed' | 'failed';
}