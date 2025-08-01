// server/src/middleware/encryption.ts
import { Request, Response, NextFunction } from 'express';
import { cryptoUtils } from '../utils/crypto_utils';
import { EncryptedRequest as EncryptedRequestPayload } from '../types';

export interface DecryptedRequest extends Request {
  decryptedBody?: any;
}

export const decryptMiddleware = (req: DecryptedRequest, res: Response, next: NextFunction): void => {
  try {
    if (req.body && req.body.encryptedData) {
      const { encryptedData, type } = req.body as EncryptedRequestPayload;
      const decryptedData = cryptoUtils.decryptData(encryptedData, type);
      req.decryptedBody = JSON.parse(decryptedData);
    }
    next();
  } catch (error) {
    console.error('Decryption middleware error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to decrypt request data'
    });
  }
};

export const encryptResponse = (data: any): { encryptedResponse: string | any; type: 'standard' | 'large' } => {
  try {
    const { encryptedData, type } = cryptoUtils.encryptData(JSON.stringify(data));
    return {
      encryptedResponse: encryptedData,
      type
    };
  } catch (error) {
    console.error('Response encryption error:', error);
    throw error;
  }
};