// server/src/utils/keyManager.ts
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

class KeyManager {
  private serverPrivateKey: string | null = null;
  private serverPublicKey: string | null = null;
  private clientPublicKey: string | null = null;

  constructor() {
    this.loadKeys();
  }

  private loadKeys(): void {
    try {
      const keysDir = path.join(__dirname, '../../keys');
      
      this.serverPrivateKey = fs.readFileSync(
        path.join(keysDir, 'server-private.pem'), 
        'utf8'
      );
      
      this.serverPublicKey = fs.readFileSync(
        path.join(keysDir, 'server-public.pem'), 
        'utf8'
      );
      
      this.clientPublicKey = fs.readFileSync(
        path.join(keysDir, 'client-public.pem'), 
        'utf8'
      );
      
      console.log('✅ All encryption keys loaded successfully');
      this.verifyAllKeys();
    } catch (error) {
      console.error('❌ Error loading keys:', (error as Error).message);
      throw new Error('Failed to load encryption keys');
    }
  }

  public getServerPrivateKey(): string {
    if (!this.serverPrivateKey) {
      throw new Error('Server private key not loaded');
    }
    return this.serverPrivateKey;
  }

  public getServerPublicKey(): string {
    if (!this.serverPublicKey) {
      throw new Error('Server public key not loaded');
    }
    return this.serverPublicKey;
  }

  public getClientPublicKey(): string {
    if (!this.clientPublicKey) {
      throw new Error('Client public key not loaded');
    }
    return this.clientPublicKey;
  }

  private verifyKeyFormat(key: string, keyType: 'private' | 'public'): boolean {
    try {
      if (keyType === 'private') {
        crypto.createPrivateKey(key);
      } else {
        crypto.createPublicKey(key);
      }
      return true;
    } catch (error) {
      console.error(`Invalid ${keyType} key format:`, (error as Error).message);
      return false;
    }
  }

  private verifyAllKeys(): void {
    const results = {
      serverPrivate: this.verifyKeyFormat(this.serverPrivateKey!, 'private'),
      serverPublic: this.verifyKeyFormat(this.serverPublicKey!, 'public'),
      clientPublic: this.verifyKeyFormat(this.clientPublicKey!, 'public')
    };

    const allValid = Object.values(results).every(valid => valid);
    
    if (allValid) {
      console.log('✅ All keys verified successfully');
    } else {
      console.error('❌ Some keys failed verification:', results);
    }
  }

  public getKeyFingerprints(): { serverPublic: string; clientPublic: string } | null {
    try {
      const serverPublicFingerprint = crypto
        .createHash('sha256')
        .update(this.serverPublicKey!)
        .digest('hex')
        .substring(0, 16);

      const clientPublicFingerprint = crypto
        .createHash('sha256')
        .update(this.clientPublicKey!)
        .digest('hex')
        .substring(0, 16);

      return {
        serverPublic: serverPublicFingerprint,
        clientPublic: clientPublicFingerprint
      };
    } catch (error) {
      console.error('Error generating key fingerprints:', error);
      return null;
    }
  }
}

export const keyManager = new KeyManager();
export default keyManager;