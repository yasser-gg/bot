import { JWT_SECRET } from './secrets';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateJwt = (userId: string, email: string) =>
	jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1d' });

export const verifyJwt = (token: string): [boolean, string | object | null] => {
	let data: string | object;
	try {
		data = jwt.verify(token, JWT_SECRET);
	} catch (err) {
		return [false, null];
	}

	return [true, data];
};

export const authenticationMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers['token'] as string;
	if (token == null) return res.send(401);

	const [isValid] = verifyJwt(token);
	if (!isValid) return res.send(401);

	return next();
};

export const checkBehanceAccessTokenExpired = (token: string): boolean => {
	const claims = jwt.decode(token) as { [key: string]: any };
	const createdAt: number = Number.parseInt(claims.created_at);
	const expiresIn: number = Number.parseInt(claims.expires_in);
	const expirationTime = createdAt + expiresIn;

	return Date.now() >= expirationTime;
};

export const getUserIdFromRequest = (req: Request): Types.ObjectId => {
	const token: string = req.header('token') as string;
	const claims = jwt.decode(token) as { [key: string]: any };
	const { userId } = claims;
	return Types.ObjectId.createFromHexString(userId);
};
