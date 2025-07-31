// client/src/services/cryptoService.ts
import { EncryptionKeys, EncryptionStatus, HybridEncryptedData } from '@/types';
import { EncryptionUtils } from '@/utils/encryption';

class CryptoService {
  private keys: EncryptionKeys | null = null;
  private status: EncryptionStatus = {
    isLoaded: false,
    isLoading: false,
    error: null,
    keyFingerprints: null
  };

  private listeners: Array<(status: EncryptionStatus) => void> = [];

  subscribe(listener: (status: EncryptionStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.status); // Send initial status
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.status));
  }

  private updateStatus(updates: Partial<EncryptionStatus>): void {
    this.status = { ...this.status, ...updates };
    this.notifyListeners();
  }

  async loadKeys(): Promise<boolean> {
    if (this.status.isLoading) return false;
    
    this.updateStatus({ isLoading: true, error: null });

    try {
      // Get client private key from environment variable (Docker)
      const clientPrivateKeyB64 = import.meta.env.VITE_CLIENT_PRIVATE_KEY_B64;
      
      if (!clientPrivateKeyB64) {
        throw new Error('Client private key not found in environment variables');
      }
      
      // Decode base64 private key
      const clientPrivatePem = atob(clientPrivateKeyB64);
      
      // Fetch public keys from backend (via Vite proxy to port 3001)
      const [clientPublicPem, serverPublicPem] = await Promise.all([
        fetch('/keys/client-public.pem').then(r => {
          if (!r.ok) throw new Error(`Failed to fetch client public key: ${r.status}`);
          return r.text();
        }),
        fetch('/keys/server-public.pem').then(r => {
          if (!r.ok) throw new Error(`Failed to fetch server public key: ${r.status}`);
          return r.text();
        })
      ]);

      // Import all keys
      const [clientPrivate, clientPublic, serverPublic] = await Promise.all([
        EncryptionUtils.importPrivateKey(clientPrivatePem), // From environment variable
        EncryptionUtils.importPublicKey(clientPublicPem),   // From backend
        EncryptionUtils.importPublicKey(serverPublicPem)    // From backend
      ]);

      this.keys = { clientPrivate, clientPublic, serverPublic };

      // Generate fingerprints
      const keyFingerprints = {
        clientPublic: EncryptionUtils.generateKeyFingerprint(clientPublicPem),
        serverPublic: EncryptionUtils.generateKeyFingerprint(serverPublicPem)
      };

      this.updateStatus({
        isLoaded: true,
        isLoading: false,
        keyFingerprints
      });

      console.log('✅ Encryption keys loaded successfully');
      console.log('🔐 Client private key: loaded from environment variable');
      console.log('🌐 Public keys: fetched from backend');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to load encryption keys:', errorMessage);
      
      this.updateStatus({
        isLoaded: false,
        isLoading: false,
        error: errorMessage
      });
      
      return false;
    }
  }

  async encryptForServer(data: string): Promise<string> {
    if (!this.keys) throw new Error('Encryption keys not loaded');
    
    return await EncryptionUtils.encryptWithPublicKey(data, this.keys.serverPublic);
  }

  async decryptFromServer(encryptedData: string): Promise<string> {
    if (!this.keys) throw new Error('Encryption keys not loaded');
    
    return await EncryptionUtils.decryptWithPrivateKey(encryptedData, this.keys.clientPrivate);
  }

  async encryptLargeDataForServer(data: string): Promise<HybridEncryptedData> {
    if (!this.keys) throw new Error('Encryption keys not loaded');
    
    return await EncryptionUtils.encryptLargeData(data, this.keys.serverPublic);
  }

  async decryptLargeDataFromServer(encryptedObj: HybridEncryptedData): Promise<string> {
    if (!this.keys) throw new Error('Encryption keys not loaded');
    
    return await EncryptionUtils.decryptLargeData(encryptedObj, this.keys.clientPrivate);
  }

  getStatus(): EncryptionStatus {
    return this.status;
  }

  isReady(): boolean {
    return this.status.isLoaded && this.keys !== null;
  }
}

export const cryptoService = new CryptoService();