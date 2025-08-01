import { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  TransactionQuery
} from '@/types/transaction';
import { apiService } from './api';

class TransactionService {
  // ✅ Perfect typing: Get all transactions
  async getTransactions(query?: TransactionQuery): Promise<Transaction[]> {
    const url = query ? this.buildQueryString('/transactions', query) : '/transactions';
    const response = await apiService.get<Transaction[]>(url);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch transactions');
    }
    return response.data || [];
  }

  // ✅ Perfect typing: Get single transaction
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

  // ✅ Perfect typing: Create transaction (different request/response types)
  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const response = await apiService.post<Transaction, CreateTransactionRequest>(
      '/transactions', 
      transactionData
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create transaction');
    }
    if (!response.data) {
      throw new Error('No transaction data returned');
    }
    return response.data;
  }

  // ✅ Perfect typing: Update transaction (PUT - full update)
  async updateTransaction(
    id: number, 
    updateData: UpdateTransactionRequest
  ): Promise<Transaction> {
    const response = await apiService.put<Transaction, UpdateTransactionRequest>(
      `/transactions/${id}`, 
      updateData
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update transaction');
    }
    if (!response.data) {
      throw new Error('No transaction data returned');
    }
    return response.data;
  }

  // ✅ Perfect typing: Patch transaction (PATCH - partial update)
  async patchTransaction(
    id: number, 
    patchData: Partial<UpdateTransactionRequest>
  ): Promise<Transaction> {
    const response = await apiService.patch<Transaction, Partial<UpdateTransactionRequest>>(
      `/transactions/${id}`, 
      patchData
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to patch transaction');
    }
    if (!response.data) {
      throw new Error('No transaction data returned');
    }
    return response.data;
  }

  // ✅ Perfect typing: Delete transaction
  async deleteTransaction(id: number): Promise<void> {
    interface DeleteResponse {
      message: string;
      deletedId: number;
    }
    
    const response = await apiService.delete<DeleteResponse>(`/transactions/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete transaction');
    }
  }

  // ✅ Perfect typing: Get transactions by user
  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return this.getTransactions({ userId });
  }

  // ✅ Perfect typing: Get transaction statistics
  async getTransactionStats(userId?: number): Promise<{
    totalCredits: number;
    totalDebits: number;
    balance: number;
    transactionCount: number;
  }> {
    const url = userId ? `/transactions/stats?userId=${userId}` : '/transactions/stats';
    const response = await apiService.get<{
      totalCredits: number;
      totalDebits: number;
      balance: number;
      transactionCount: number;
    }>(url);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch transaction statistics');
    }
    if (!response.data) {
      throw new Error('No statistics data returned');
    }
    return response.data;
  }

  // ✅ Utility method: Build query string from query object
  private buildQueryString(baseUrl: string, query: TransactionQuery): string {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
}

export const transactionService = new TransactionService();