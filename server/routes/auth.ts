'use strict';

// import packages and dependencies
import auth from '../controllers/auth';
import { authenticate } from '../utils/auth';
import express from "express";
const router = express();

router.post('/refresh', auth.refresh);
 
router.post('/login', auth.login);
 
router.post('/logout', authenticate, auth.logout);
 
export default router;