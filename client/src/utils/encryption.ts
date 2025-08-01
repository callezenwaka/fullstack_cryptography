// client/src/utils/encryption.ts
import { HybridEncryptedData } from '@/types';

export class EncryptionUtils {
  private static readonly RSA_ALGORITHM = 'RSA-OAEP';
  private static readonly AES_ALGORITHM = 'AES-GCM';
  private static readonly HASH_ALGORITHM = 'SHA-256';
  private static readonly AAD = 'my-aad';

  // === Utility Methods ===

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

  static generateKeyFingerprint(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  // === Key Import Methods ===

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

  // === Simple RSA Encryption/Decryption ===

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

  // === Hybrid Encryption/Decryption for Large Data ===

  static async encryptLargeData(data: string, publicKey: CryptoKey): Promise<HybridEncryptedData> {
    // Generate AES key
    const aesKey = await crypto.subtle.generateKey(
      { name: this.AES_ALGORITHM, length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Prepare AAD
    const additionalData = new TextEncoder().encode(this.AAD);

    // Encrypt data with AES-GCM
    const encodedData = new TextEncoder().encode(data);
    const encryptedDataWithTag = await crypto.subtle.encrypt(
      { name: this.AES_ALGORITHM, iv, additionalData },
      aesKey,
      encodedData
    );

    // Encrypt AES key with RSA
    const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedAesKey = await crypto.subtle.encrypt(
      { name: this.RSA_ALGORITHM },
      publicKey,
      exportedAesKey
    );

    return {
      encryptedData: this.arrayBufferToBase64(encryptedDataWithTag),
      encryptedKey: this.arrayBufferToBase64(encryptedAesKey),
      iv: this.arrayBufferToBase64(iv.buffer)
    };
  }

  static async decryptLargeData(
    encryptedObj: HybridEncryptedData,
    privateKey: CryptoKey
  ): Promise<string> {
    try {
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

      // Handle server format (ciphertext:authTag) vs client format (combined)
      let combinedBuffer: ArrayBuffer;
      
      if (encryptedObj.encryptedData.includes(':')) {
        // Server format: split and recombine
        const parts = encryptedObj.encryptedData.split(':');
        if (parts.length !== 2) {
          throw new Error('Invalid encryptedData format: expected cipherText:authTag');
        }

        const cipherTextBuffer = this.base64ToArrayBuffer(parts[0]);
        const authTagBuffer = this.base64ToArrayBuffer(parts[1]);
        
        // Validate sizes
        if (authTagBuffer.byteLength !== 16) {
          throw new Error(`Invalid auth tag size: expected 16 bytes, got ${authTagBuffer.byteLength}`);
        }

        // Combine ciphertext and auth tag for Web Crypto API
        const combined = new Uint8Array(cipherTextBuffer.byteLength + authTagBuffer.byteLength);
        combined.set(new Uint8Array(cipherTextBuffer), 0);
        combined.set(new Uint8Array(authTagBuffer), cipherTextBuffer.byteLength);
        combinedBuffer = combined.buffer;
      } else {
        // Client format: already combined
        combinedBuffer = this.base64ToArrayBuffer(encryptedObj.encryptedData);
      }

      // Prepare decryption parameters
      const ivBuffer = this.base64ToArrayBuffer(encryptedObj.iv);
      const additionalDataBuffer = new TextEncoder().encode(this.AAD);

      // Validate IV size
      if (ivBuffer.byteLength !== 12) {
        throw new Error(`Invalid IV size: expected 12 bytes, got ${ivBuffer.byteLength}`);
      }

      // Decrypt with AES-GCM
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.AES_ALGORITHM,
          iv: ivBuffer,
          additionalData: additionalDataBuffer,
          tagLength: 128
        },
        aesKey,
        combinedBuffer
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}