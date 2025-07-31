import { Transaction, CreateTransactionRequest } from '@/types/transaction';
import { ApiResponse } from '@/types';
import { apiService } from './api';

class TransactionService {
  async getTransactions(): Promise<Transaction[]> {
    const response = await apiService.get<Transaction[]>('/transactions');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch transactions');
    }
    return response.data || [];
  }

  async getTransaction(id: number): Promise<Transaction> {
    const response = await apiService.get<Transaction>(`/transactions/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch transaction');
    }
    if (!response.data) {
      throw new Error('Transaction not found');
    }
    return response.data;
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const response = await apiService.post<Transaction>('/transactions', transactionData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create transaction');
    }
    if (!response.data) {
      throw new Error('No transaction data returned');
    }
    return response.data;
  }
}

export const transactionService = new TransactionService();