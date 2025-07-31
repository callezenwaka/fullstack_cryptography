import { Request, Response } from 'express';
import { TransactionModel } from '../models';
import { ApiResponse } from '../types';
import { CreateTransactionRequest } from '../types/transaction';
import { cryptoUtils } from '../utils/crypto_utils';

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await TransactionModel.findAll();
    
    const response: ApiResponse = {
      success: true,
      data: transactions,
      message: 'Transactions retrieved successfully'
    };

    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(response));
    
    res.json({
      encryptedResponse: encryptedData,
      type
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to retrieve transactions'
    };

    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
    
    res.status(500).json({
      encryptedResponse: encryptedData,
      type
    });
  }
};

export const getTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const transactionId = parseInt(id, 10);

    if (isNaN(transactionId)) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Invalid transaction ID'
      };

      const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
      
      res.status(400).json({
        encryptedResponse: encryptedData,
        type
      });
      return;
    }

    const transaction = await TransactionModel.findById(transactionId);
    
    if (!transaction) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Transaction not found'
      };

      const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
      
      res.status(404).json({
        encryptedResponse: encryptedData,
        type
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: 'Transaction retrieved successfully'
    };

    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(response));
    
    res.json({
      encryptedResponse: encryptedData,
      type
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to retrieve transaction'
    };

    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
    
    res.status(500).json({
      encryptedResponse: encryptedData,
      type
    });
  }
};

export const sendTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    // Decrypt the incoming request
    const { encryptedData, type } = req.body;
    const decryptedData = cryptoUtils.decryptData(encryptedData, type);
    const transactionData: CreateTransactionRequest = JSON.parse(decryptedData);

    // Validate transaction data
    if (!transactionData.userId || !transactionData.amount || !transactionData.type || !transactionData.description) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Missing required fields: userId, amount, type, description'
      };

      const { encryptedData: errorEncrypted, type: errorType } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
      
      res.status(400).json({
        encryptedResponse: errorEncrypted,
        type: errorType
      });
      return;
    }

    if (transactionData.amount <= 0) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Amount must be greater than 0'
      };

      const { encryptedData: errorEncrypted, type: errorType } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
      
      res.status(400).json({
        encryptedResponse: errorEncrypted,
        type: errorType
      });
      return;
    }

    const transaction = await TransactionModel.create(transactionData);
    
    // Simulate processing delay
    setTimeout(async () => {
      await TransactionModel.updateStatus(transaction.id, 'completed');
    }, 2000);

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    };

    const { encryptedData: responseEncrypted, type: responseType } = cryptoUtils.encryptData(JSON.stringify(response));
    
    res.status(201).json({
      encryptedResponse: responseEncrypted,
      type: responseType
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to create transaction'
    };

    const { encryptedData: errorEncrypted, type: errorType } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
    
    res.status(500).json({
      encryptedResponse: errorEncrypted,
      type: errorType
    });
  }
};