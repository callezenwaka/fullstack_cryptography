// server/src/services/transactionService.ts
import { TransactionModel } from '../models';
import { CreateTransactionRequest, UpdateTransactionRequest, Transaction } from '../types/transaction';

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
      // setTimeout(async () => {
      //   await TransactionModel.updateStatus(transaction.id, 'completed');
      // }, 2000);

      setTimeout(async () => {
        try {
          await TransactionModel.updateStatus(transaction.id, 'completed');
        } catch (error) {
          console.error('Failed to update transaction status:', error);
          // Maybe add to a retry queue or alert system
        }
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

  async updateTransaction(id: number, transactionData: UpdateTransactionRequest): Promise<Transaction | null> {
  try {
    if (isNaN(id)) {
      throw new Error('Invalid transaction ID');
    }

    const existingTransaction = await TransactionModel.findById(id);
    if (!existingTransaction) {
      return null;
    }

    // Business rule: Only pending transactions can be updated
    if (existingTransaction.status !== 'pending' && transactionData.status) {
      throw new Error('Cannot update status of non-pending transaction');
    }

    // Validate amount if provided
    if (transactionData.amount !== undefined && transactionData.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    return await TransactionModel.update(id, transactionData);
  } catch (error) {
    console.error('Error in TransactionService.updateTransaction:', error);
    
    if (error instanceof Error && (
      error.message.includes('Invalid') || 
      error.message.includes('Cannot update') ||
      error.message.includes('must be greater than')
    )) {
      throw error;
    }
    
    throw new Error('Failed to update transaction');
  }
}
}