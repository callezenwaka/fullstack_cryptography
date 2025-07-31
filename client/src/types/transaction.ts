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