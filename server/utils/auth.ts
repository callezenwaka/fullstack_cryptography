import { Request, Response, NextFunction } from "express";
import { verify, sign } from "jsonwebtoken";

/**
 * [START GET TOKEN]
 * @param {object} req Express request context.
 * @param {object} res Express response context.
 * @param {object} next Express next context.
 */
const getAuthToken = (req: any, res: Response, next: NextFunction) => {
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
		req.authToken = req.headers.authorization.split(' ')[1];
	} else {
		req.authToken = null;
	}
	next();
};
// [END GET TOKEN]

/**
 * [START CHECK AUTH]
 * @param {object} req Express request context.
 * @param {object} res Express response context.
 * @param {object} next Express next context.
 * Define auth middleware.
 */
export const authenticate = (req: any, res: Response, next: NextFunction) => {
	getAuthToken(req, res, async () => {
		try {
			// Todo: Verify token
			const { authToken } = req;
			req.payload = verify(authToken, `${process.env.ACCESS_TOKEN_SECRET}`);
			return next();
		} catch (error) {
			return res.status(401).json("Unauthorized");
		}
	});
}
// [END CHECK AUTH]

export const generateAccessToken = (credential: string) => {
  return sign({credential}, `${process.env.ACCESS_TOKEN_SECRET}`, {
    expiresIn: '15m',
  });
}

export const generateRefreshToken = (credential: string) => {
  return sign({credential}, `${process.env.REFRESH_TOKEN_SECRET}`);
}

export default {
	authenticate,
	generateAccessToken,
	generateRefreshToken,
}