import express from 'express';
import userRoutes from './userRoute';
import transactionRoutes from './transactionRoute';
import { keyManager } from '../utils/keyManager';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get server's public key for client
router.get('/public-key', (req, res) => {
  try {
    res.json({
      publicKey: keyManager.getServerPublicKey(),
      fingerprint: keyManager.getKeyFingerprints()?.serverPublic
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve public key'
    });
  }
});

// Mount route modules
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);

export default router;
