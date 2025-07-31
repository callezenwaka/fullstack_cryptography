// client/src/utils/encryption.ts
import { HybridEncryptedData } from '@/types';

export class EncryptionUtils {
  private static readonly RSA_ALGORITHM = 'RSA-OAEP';
  private static readonly AES_ALGORITHM = 'AES-GCM';
  private static readonly HASH_ALGORITHM = 'SHA-256';

  static pemToArrayBuffer(pem: string): ArrayBuffer {
    const base64 = pem
      .replace(/-----BEGIN.*?-----/g, '')
      .replace(/-----END.*?-----/g, '')
      .replace(/\s/g, '');
    
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }

  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static async importPublicKey(pemKey: string): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'spki',
      this.pemToArrayBuffer(pemKey),
      {
        name: this.RSA_ALGORITHM,
        hash: this.HASH_ALGORITHM
      },
      false,
      ['encrypt']
    );
  }

  static async importPrivateKey(pemKey: string): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'pkcs8',
      this.pemToArrayBuffer(pemKey),
      {
        name: this.RSA_ALGORITHM,
        hash: this.HASH_ALGORITHM
      },
      false,
      ['decrypt']
    );
  }

  static async encryptWithPublicKey(data: string, publicKey: CryptoKey): Promise<string> {
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
      { name: this.RSA_ALGORITHM },
      publicKey,
      encodedData
    );
    return this.arrayBufferToBase64(encrypted);
  }

  static async decryptWithPrivateKey(encryptedData: string, privateKey: CryptoKey): Promise<string> {
    const buffer = this.base64ToArrayBuffer(encryptedData);
    const decrypted = await crypto.subtle.decrypt(
      { name: this.RSA_ALGORITHM },
      privateKey,
      buffer
    );
    return new TextDecoder().decode(decrypted);
  }

  static async encryptLargeData(data: string, publicKey: CryptoKey): Promise<HybridEncryptedData> {
    // Generate AES key
    const aesKey = await crypto.subtle.generateKey(
      { name: this.AES_ALGORITHM, length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data with AES
    const encodedData = new TextEncoder().encode(data);
    const encryptedData = await crypto.subtle.encrypt(
      { name: this.AES_ALGORITHM, iv },
      aesKey,
      encodedData
    );

    // Export and encrypt AES key with RSA
    const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedAesKey = await crypto.subtle.encrypt(
      { name: this.RSA_ALGORITHM },
      publicKey,
      exportedAesKey
    );

    return {
      encryptedData: this.arrayBufferToBase64(encryptedData),
      encryptedKey: this.arrayBufferToBase64(encryptedAesKey),
      iv: this.arrayBufferToBase64(iv.buffer)
    };
  }

  static async decryptLargeData(
    encryptedObj: HybridEncryptedData, 
    privateKey: CryptoKey
  ): Promise<string> {
    // Decrypt AES key
    const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedObj.encryptedKey);
    const aesKeyBuffer = await crypto.subtle.decrypt(
      { name: this.RSA_ALGORITHM },
      privateKey,
      encryptedKeyBuffer
    );

    // Import AES key
    const aesKey = await crypto.subtle.importKey(
      'raw',
      aesKeyBuffer,
      { name: this.AES_ALGORITHM },
      false,
      ['decrypt']
    );

    // Decrypt data
    const encryptedDataBuffer = this.base64ToArrayBuffer(encryptedObj.encryptedData);
    const ivBuffer = this.base64ToArrayBuffer(encryptedObj.iv);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: this.AES_ALGORITHM, iv: ivBuffer },
      aesKey,
      encryptedDataBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  static generateKeyFingerprint(key: string): string {
    // Simple fingerprint generation
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }
}