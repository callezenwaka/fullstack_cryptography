'use strict';

// import packages and dependencies
import { authenticate } from '../utils/auth';
import crypto from "../controllers/index";
import express from "express";
const router = express();

router.get('/', authenticate, crypto.getTransactions);

router.get('/count', authenticate, crypto.getTransactionCount);

router.post('/', authenticate, crypto.sendTransaction);
 
export default router;