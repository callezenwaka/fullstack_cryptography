// server/src/utils/crypto_utils.ts
import * as crypto from 'crypto';
import { keyManager } from './keyManager';
import { HybridEncryptedData } from '../types';

class CryptoUtils {
  private readonly RSA_KEY_SIZE = 2048;
  private readonly AES_KEY_SIZE = 32; // 256 bits
  private readonly IV_SIZE = 16; // 128 bits

  // Decrypt data received from client (encrypted with server's public key)
  public decryptWithServerPrivateKey(encryptedData: string): string {
    try {
      const buffer = Buffer.from(encryptedData, 'base64');
      const decrypted = crypto.privateDecrypt(
        {
          key: keyManager.getServerPrivateKey(),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        buffer
      );
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${(error as Error).message}`);
    }
  }

  // Encrypt data to send to client (using client's public key)
  public encryptWithClientPublicKey(data: string): string {
    try {
      const buffer = Buffer.from(data, 'utf8');
      const encrypted = crypto.publicEncrypt(
        {
          key: keyManager.getClientPublicKey(),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        buffer
      );
      return encrypted.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${(error as Error).message}`);
    }
  }

  // For large data, use hybrid encryption (RSA + AES)
  public encryptLargeData(data: string): HybridEncryptedData {
    try {
      // Generate random AES key and IV
      const aesKey = crypto.randomBytes(this.AES_KEY_SIZE);
      const iv = crypto.randomBytes(this.IV_SIZE);

      // Encrypt data with AES
      const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
      cipher.setAAD(Buffer.from('authenticated-data'));
      
      let encryptedData = cipher.update(data, 'utf8', 'base64');
      encryptedData += cipher.final('base64');
      
      const authTag = cipher.getAuthTag();

      // Encrypt AES key with RSA (client's public key)
      const encryptedKey = crypto.publicEncrypt(
        {
          key: keyManager.getClientPublicKey(),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        aesKey
      );

      return {
        encryptedData: encryptedData + ':' + authTag.toString('base64'),
        encryptedKey: encryptedKey.toString('base64'),
        iv: iv.toString('base64')
      };
    } catch (error) {
      throw new Error(`Large data encryption failed: ${(error as Error).message}`);
    }
  }

  public decryptLargeData(encryptedObj: HybridEncryptedData): string {
    try {
      // Decrypt AES key with RSA (server's private key)
      const aesKey = crypto.privateDecrypt(
        {
          key: keyManager.getServerPrivateKey(),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(encryptedObj.encryptedKey, 'base64')
      );

      // Extract encrypted data and auth tag
      const [encryptedData, authTagBase64] = encryptedObj.encryptedData.split(':');
      const authTag = Buffer.from(authTagBase64, 'base64');
      const iv = Buffer.from(encryptedObj.iv, 'base64');

      // Decrypt data with AES
      const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
      decipher.setAAD(Buffer.from('authenticated-data'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Large data decryption failed: ${(error as Error).message}`);
    }
  }

  // Utility to check if data is too large for direct RSA encryption
  public isDataTooLargeForRSA(data: string): boolean {
    const maxRSASize = (this.RSA_KEY_SIZE / 8) - 66; // Account for OAEP padding
    return Buffer.from(data, 'utf8').length > maxRSASize;
  }

  // Encrypt data automatically choosing the right method
  public encryptData(data: string): { encryptedData: string | HybridEncryptedData; type: 'standard' | 'large' } {
    if (this.isDataTooLargeForRSA(data)) {
      return {
        encryptedData: this.encryptLargeData(data),
        type: 'large'
      };
    } else {
      return {
        encryptedData: this.encryptWithClientPublicKey(data),
        type: 'standard'
      };
    }
  }

  // Decrypt data automatically detecting the method
  public decryptData(encryptedData: string | HybridEncryptedData, type: 'standard' | 'large'): string {
    if (type === 'large') {
      return this.decryptLargeData(encryptedData as HybridEncryptedData);
    } else {
      return this.decryptWithServerPrivateKey(encryptedData as string);
    }
  }
}

export const cryptoUtils = new CryptoUtils();
export default cryptoUtils;