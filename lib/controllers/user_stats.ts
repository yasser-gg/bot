import { Request, Response, NextFunction } from 'express';
import { BehanceUserStats } from '../models/BehanceUserStats';
import { getUserIdFromRequest } from '../util/jwt';

export const getMyStats = async (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	try {
		const userId = getUserIdFromRequest(req);
		const user = await BehanceUserStats.findOne({ userId });
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ errors: [error] });
	}
};
