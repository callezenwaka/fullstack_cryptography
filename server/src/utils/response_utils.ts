// server/src/utils/response_utils.ts
import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { cryptoUtils } from './crypto_utils';

export class ResponseUtils {
  static sendEncryptedResponse(
    res: Response, 
    statusCode: number, 
    response: ApiResponse
  ): void {
    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(response));
    
    res.status(statusCode).json({
      encryptedResponse: encryptedData,
      type
    });
  }

  static sendSuccess(
    res: Response, 
    data: any, 
    message: string, 
    statusCode: number = 200
  ): void {
    const response: ApiResponse = {
      success: true,
      data,
      message
    };

    this.sendEncryptedResponse(res, statusCode, response);
  }

  static sendError(
    res: Response, 
    error: string, 
    statusCode: number = 500
  ): void {
    const response: ApiResponse = {
      success: false,
      error
    };

    this.sendEncryptedResponse(res, statusCode, response);
  }

  static sendNotFound(res: Response, message: string = 'Resource not found'): void {
    this.sendError(res, message, 404);
  }

  static sendBadRequest(res: Response, message: string = 'Bad request'): void {
    this.sendError(res, message, 400);
  }

  static decryptRequestData<T>(req: Request): T {
    try {
      const { encryptedData, type } = req.body;
      
      if (!encryptedData || !type) {
        throw new Error('Missing encrypted data or type');
      }

      const decryptedData = cryptoUtils.decryptData(encryptedData, type);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error decrypting request data:', error);
      throw new Error('Failed to decrypt request data');
    }
  }

  static handleDecryptionError(res: Response, error: Error): void {
    if (error.message.includes('decrypt') || error.message.includes('encrypted')) {
      this.sendBadRequest(res, 'Invalid encrypted data format');
    } else {
      this.sendError(res, 'Failed to process request');
    }
  }
}