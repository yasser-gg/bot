import { Request, Response, NextFunction } from 'express';
import { UserEvents } from '../models/UserEvents';
import { getUserIdFromRequest } from '../util/jwt';

export const getMyEvents = async (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	try {
		const userId = getUserIdFromRequest(req);
		const user = await UserEvents.findOne({ userId });
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ errors: [error] });
	}
};
