import 'dotenv/config';
import { Response, NextFunction } from "express";
import { ethers } from 'ethers';
import Transaction from '../types/Transaction';
import { contractABI, contractAddress } from "../config";

/**
 * [START GET ALL TRANSACTIONS]
 * @param {object} req Express request context.
 * @param {object} res Express response context.
 * @param {object} next Express next context.
 * @return {object} json items
 * Retrieve items
 */
export const getTransactions = async (req: any, res: Response, next: NextFunction) => {
	try {
		// Todo: create a provider and query for transactiona
    const provider = new ethers.providers.JsonRpcProvider(`https://ropsten.infura.io/v3/${process.env.PROJECT_ID}`);
    const wallet = new ethers.Wallet(`0x${req.payload.credential}`);
    const signer = wallet.connect(provider);

    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    const availableTransactions = await transactionsContract.getAllTransactions();
    const transactions = availableTransactions.map((transaction: Transaction) => ({
      addressTo: transaction.receiver,
      addressFrom: transaction.sender,
      timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
      message: transaction.message,
      amount: parseInt(transaction.amount._hex) / (10 ** 18)
    }));

		if (!transactions.length) {
			return res.status(200).json([]);
		}
    
		return res.status(200).json(transactions);
	} catch (error) {
		return res.status(500).json('Internal Server Error!');
	}
}
// [END GET ALL TRANSACTIONS]

/**
 * [START GET TRANSACTION COUNT]
 * @param {object} req Express request context.
 * @param {object} res Express response context.
 * @param {object} next Express next context.
 * @return {object} json items
 * Retrieve count
 */
 export const getTransactionCount = async (req: any, res: Response, next: NextFunction) => {
	try {
		// Todo: create a provider and query for transaction count
    const provider = new ethers.providers.JsonRpcProvider(`https://ropsten.infura.io/v3/${process.env.PROJECT_ID}`);
    const wallet = new ethers.Wallet(`0x${req.payload.credential}`);
    const signer = wallet.connect(provider);

    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    const transactionsCount = await transactionsContract.getTransactionCount();

		return res.status(200).json(transactionsCount.toNumber());
	} catch (error) {
    console.log(error);
		return res.status(500).json('Internal Server Error!');
	}
}
// [END GET TRANSACTION COUNT]

/**
 * [START SEND TRANSACTION]
 * @param {object} req Express request context.
 * @param {object} res Express response context.
 * @param {object} next Express next context.
 * @return {object} json items
 * Send item
 */
export const sendTransaction = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Todo: create a provider and send transaction
    const { receiver, amount, message } = req.body;
    const provider = new ethers.providers.JsonRpcProvider(`https://ropsten.infura.io/v3/${process.env.PROJECT_ID}`);
    const wallet = new ethers.Wallet(`0x${req.payload.credential}`);
    const signer = wallet.connect(provider);

    const parsedAmount = ethers.utils.parseEther(amount);
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    const transactionHash = await transactionsContract.addToBlockchain(receiver, parsedAmount, message);
    // await transactionHash.wait();

    return res.status(200).json(transactionHash.hash);
  } catch (error) {
    return res.status(500).json('Internal Server Error!');
  }
}
// [END SEND TRANSACTION]

export default {
	getTransactions,
  getTransactionCount,
	sendTransaction,
}