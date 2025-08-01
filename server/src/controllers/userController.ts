// server/src/controllers/userController.ts
import { Request, Response } from 'express';
import { UserModel } from '../models';
import { ApiResponse } from '../types';
import { cryptoUtils } from '../utils/crypto_utils';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.findAll();
    
    const response: ApiResponse = {
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    };

    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(response));
    
    res.json({
      encryptedResponse: encryptedData,
      type
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to retrieve users'
    };

    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
    
    res.status(500).json({
      encryptedResponse: encryptedData,
      type
    });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Invalid user ID'
      };

      const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
      
      res.status(400).json({
        encryptedResponse: encryptedData,
        type
      });
      return;
    }

    const user = await UserModel.findById(userId);
    
    if (!user) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'User not found'
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
      data: user,
      message: 'User retrieved successfully'
    };

    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(response));
    
    res.json({
      encryptedResponse: encryptedData,
      type
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to retrieve user'
    };

    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(errorResponse));
    
    res.status(500).json({
      encryptedResponse: encryptedData,
      type
    });
  }
};