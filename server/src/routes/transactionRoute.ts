import express from 'express';
import { getTransactions, getTransaction, sendTransaction } from '../controllers';

const router = express.Router();

router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', sendTransaction);

export default router;
