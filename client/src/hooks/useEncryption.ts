import { useState, useEffect } from 'react';
import { EncryptionStatus } from '@/types';
import { cryptoService } from '@/services/cryptoService';

export const useEncryption = () => {
  const [status, setStatus] = useState<EncryptionStatus>({
    isLoaded: false,
    isLoading: false,
    error: null,
    keyFingerprints: null
  });

  useEffect(() => {
    const unsubscribe = cryptoService.subscribe(setStatus);
    
    // Initialize if not already loading or loaded
    if (!status.isLoaded && !status.isLoading) {
      cryptoService.loadKeys();
    }

    return unsubscribe;
  }, []);

  const reload = async () => {
    await cryptoService.loadKeys();
  };

  return {
    ...status,
    reload,
    isReady: cryptoService.isReady()
  };
};