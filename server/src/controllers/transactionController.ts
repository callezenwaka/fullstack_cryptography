// server/src/controllers/transactionController.ts
import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { ResponseUtils } from '../utils/response_utils';
import { CreateTransactionRequest } from '../types/transaction';

const transactionService = new TransactionService();

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await transactionService.getAllTransactions();
    ResponseUtils.sendSuccess(res, transactions, 'Transactions retrieved successfully');
  } catch (error) {
    console.error('Error in getTransactions controller:', error);
    ResponseUtils.sendError(res, 'Failed to retrieve transactions');
  }
};

export const getTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const transactionId = parseInt(id, 10);

    const transaction = await transactionService.getTransactionById(transactionId);
    
    if (!transaction) {
      ResponseUtils.sendNotFound(res, 'Transaction not found');
      return;
    }

    ResponseUtils.sendSuccess(res, transaction, 'Transaction retrieved successfully');
  } catch (error) {
    console.error('Error in getTransaction controller:', error);
    
    if (error instanceof Error && error.message === 'Invalid transaction ID') {
      ResponseUtils.sendBadRequest(res, error.message);
      return;
    }

    ResponseUtils.sendError(res, 'Failed to retrieve transaction');
  }
};

export const sendTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    // Decrypt the incoming request
    const transactionData = ResponseUtils.decryptRequestData<CreateTransactionRequest>(req);

    // Create transaction through service
    const transaction = await transactionService.createTransaction(transactionData);

    ResponseUtils.sendSuccess(res, transaction, 'Transaction created successfully', 201);
  } catch (error) {
    console.error('Error in sendTransaction controller:', error);
    
    // Handle decryption errors
    if (error instanceof Error && error.message.includes('decrypt')) {
      ResponseUtils.sendBadRequest(res, 'Invalid encrypted data format');
      return;
    }
    
    // Handle validation errors
    if (error instanceof Error && (
      error.message.includes('required') || 
      error.message.includes('must be greater than')
    )) {
      ResponseUtils.sendBadRequest(res, error.message);
      return;
    }

    ResponseUtils.sendError(res, 'Failed to create transaction');
  }
};