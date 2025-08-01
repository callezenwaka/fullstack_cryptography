// server/src/services/transactionService.ts
import { TransactionModel } from '../models';
import { CreateTransactionRequest, Transaction } from '../types/transaction';

export class TransactionService {
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      return await TransactionModel.findAll();
    } catch (error) {
      console.error('Error in TransactionService.getAllTransactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    try {
      if (isNaN(id)) {
        throw new Error('Invalid transaction ID');
      }

      return await TransactionModel.findById(id);
    } catch (error) {
      console.error('Error in TransactionService.getTransactionById:', error);
      
      if (error instanceof Error && error.message === 'Invalid transaction ID') {
        throw error;
      }
      
      throw new Error('Failed to retrieve transaction');
    }
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    try {
      // Validate transaction data
      if (!transactionData.userId || !transactionData.amount || !transactionData.type || !transactionData.description) {
        throw new Error('Missing required fields: userId, amount, type, description');
      }

      if (transactionData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const transaction = await TransactionModel.create(transactionData);
      
      // Simulate processing delay
      setTimeout(async () => {
        await TransactionModel.updateStatus(transaction.id, 'completed');
      }, 2000);

      return transaction;
    } catch (error) {
      console.error('Error in TransactionService.createTransaction:', error);
      
      if (error instanceof Error && (
        error.message.includes('required') || 
        error.message.includes('must be greater than')
      )) {
        throw error;
      }
      
      throw new Error('Failed to create transaction');
    }
  }
}