'use strict'

// Import packages and dependencies
import { ethers } from 'ethers';
import { verify } from 'jsonwebtoken';
import {Request, Response, NextFunction} from "express";
import { generateAccessToken, generateRefreshToken } from '../utils/auth';

let refreshTokens: string[] = [];

/**
 * [START LOGIN]
 * @param {object} req Express request context.
 * @param {object} res Express response context.
 * @param {object} next Express next context.
 * @return {object} json items
 * Login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Todo: get refresh token from the user
    const { credential } = req.body;
    if (!credential) return res.status(400).json("Credential is incorrect!");

    // Todo: create a provider and generate tokens
    const provider = new ethers.providers.JsonRpcProvider(`https://ropsten.infura.io/v3/${process.env.PROJECT_ID}`);
    const wallet = new ethers.Wallet(credential);
    const signer = wallet.connect(provider);

    const accessToken = generateAccessToken(credential);
    const refreshToken = generateRefreshToken(credential);
    refreshTokens.push(refreshToken);

    res.status(200).json({
      address: signer.address,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(500).json('Internal Server Error!');
  }
}
// [END LOGIN]

/**
 * [START REFRESH TOKEN]
 * @param {object} req Express request context.
 * @param {object} res Express response context.
 * @param {object} next Express next context.
 * @return {object} json items
 * Refresh token
 */
 export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Todo: get refresh token from the user
    const refreshToken: string = req.body.refreshToken;

    // Todo: send error if there is no token or it's invalid
    if (!refreshToken) return res.status(401).json('Unauthorized!')
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json('Forbidden!')
    }

    const payload = verify(refreshToken, `${process.env.REFRESH_TOKEN_SECRET}`);
    if (typeof payload == 'string') return;

    // Todo: create a provider
    const provider = new ethers.providers.JsonRpcProvider(`https://ropsten.infura.io/v3/${process.env.PROJECT_ID}`);
    const wallet = new ethers.Wallet(payload.credential);
    const signer = wallet.connect(provider);

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    const newAccessToken = generateAccessToken(payload.credential);
    const newRefreshToken = generateRefreshToken(payload.credential);
    refreshTokens.push(newRefreshToken);

    res.status(200).json({ 
      address: signer.address,
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    });
  } catch (error) {
    return res.status(500).json('Internal Server Error!')
  }
}
// [END REFRESH TOKEN]

/**
 * [START LOGOUT]
 * @param {object} req Express request context.
 * @param {object} res Express response context.
 * @param {object} next Express next context.
 * @return {object} json items
 * Logout
 */
 export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Todo: get refresh token from the user
    refreshTokens = refreshTokens.filter((token) => token !== req.body.refreshToken);

    res.status(200).json("You logged out successfully.");
  } catch (error) {
    return res.status(500).json('Internal Server Error!');
  }
}
// [END LOGOUT]

export default {
	login,
  logout,
	refresh,
}