import * as crypto from 'crypto';
import { keyManager } from './keyManager';
import { HybridEncryptedData } from '../types';

class CryptoUtils {
  private readonly RSA_KEY_SIZE = 2048;
  private readonly AES_KEY_SIZE = 32; // 256 bits
  private readonly IV_SIZE = 12; // 96 bits for AES-GCM
  private readonly HASH_SIZE = 32; // SHA-256 = 256 bits = 32 bytes
  private readonly AAD = 'my-aad';
  
  // RSA-OAEP max data size: (keySize/8) - (2*hashSize) - 2
  private readonly MAX_RSA_BYTES = (this.RSA_KEY_SIZE / 8) - (2 * this.HASH_SIZE) - 2;

  // === Simple RSA Encryption/Decryption ===

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
      throw new Error(`RSA decryption failed: ${(error as Error).message}`);
    }
  }

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
      throw new Error(`RSA encryption failed: ${(error as Error).message}`);
    }
  }

  // === Hybrid Encryption/Decryption for Large Data ===

  public encryptLargeData(data: string): HybridEncryptedData {
    try {
      // Generate random AES key and IV
      const aesKey = crypto.randomBytes(this.AES_KEY_SIZE);
      const iv = crypto.randomBytes(this.IV_SIZE);
      const aad = Buffer.from(this.AAD, 'utf8');
      
      // Encrypt data with AES-GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
      cipher.setAAD(aad);
      
      let encryptedData = cipher.update(data, 'utf8', 'base64');
      encryptedData += cipher.final('base64');
      
      const authTag = cipher.getAuthTag();

      // Encrypt AES key with client's public RSA key
      const encryptedKey = crypto.publicEncrypt(
        {
          key: keyManager.getClientPublicKey(),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        aesKey
      );

      return {
        encryptedData: `${encryptedData}:${authTag.toString('base64')}`,
        encryptedKey: encryptedKey.toString('base64'),
        iv: iv.toString('base64')
      };
    } catch (error) {
      throw new Error(`Hybrid encryption failed: ${(error as Error).message}`);
    }
  }

  public decryptLargeData(encryptedObj: HybridEncryptedData): string {
    try {
      // Decrypt AES key with server's private RSA key
      const aesKey = crypto.privateDecrypt(
        {
          key: keyManager.getServerPrivateKey(),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(encryptedObj.encryptedKey, 'base64')
      );

      // Parse encrypted data format
      const parts = encryptedObj.encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encryptedData format: expected ciphertext:authTag');
      }

      const [encryptedData, authTagBase64] = parts;
      const authTag = Buffer.from(authTagBase64, 'base64');
      const iv = Buffer.from(encryptedObj.iv, 'base64');
      const aad = Buffer.from(this.AAD, 'utf8');

      // Validate sizes
      if (iv.length !== this.IV_SIZE) {
        throw new Error(`Invalid IV size: expected ${this.IV_SIZE} bytes, got ${iv.length}`);
      }
      if (authTag.length !== 16) {
        throw new Error(`Invalid auth tag size: expected 16 bytes, got ${authTag.length}`);
      }

      // Decrypt with AES-GCM
      const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
      decipher.setAAD(aad);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Hybrid decryption failed: ${(error as Error).message}`);
    }
  }

  // === Utility Methods ===

  public isDataTooLargeForRSA(data: string): boolean {
    return Buffer.from(data, 'utf8').length > this.MAX_RSA_BYTES;
  }

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

  public decryptData(encryptedData: string | HybridEncryptedData, type: 'standard' | 'large'): string {
    if (type === 'large') {
      return this.decryptLargeData(encryptedData as HybridEncryptedData);
    } else {
      return this.decryptWithServerPrivateKey(encryptedData as string);
    }
  }

  // === Info Methods ===

  public getMaxRSABytes(): number {
    return this.MAX_RSA_BYTES;
  }

  public getEncryptionInfo() {
    return {
      rsaKeySize: this.RSA_KEY_SIZE,
      aesKeySize: this.AES_KEY_SIZE * 8, // bits
      ivSize: this.IV_SIZE,
      maxRSABytes: this.MAX_RSA_BYTES,
      aad: this.AAD
    };
  }
}

export const cryptoUtils = new CryptoUtils();
export default cryptoUtils;