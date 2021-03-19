import { generateJwt, getUserIdFromRequest } from '../util/jwt';
import { User, UserDocument } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { compare } from 'bcrypt';
import { Types } from 'mongoose';

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	await check('email', 'Invalid Email')
		.isEmail()
		.normalizeEmail({ gmail_remove_dots: false })
		.run(req);
	await check('password', 'Password cannot be blank')
		.isLength({ min: 1 })
		.run(req);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	const { email, password }: { email: string; password: string } = req.body;

	let existingUser: UserDocument;
	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(404).end();
		}
		existingUser = user;
	} catch (err) {
		return next(err);
	}
	const isPasswordValid = await compare(password, existingUser.password);

	if (isPasswordValid) {
		res.status(200).json({
			token: generateJwt(existingUser._id, email),
		});
	} else {
		res.status(401).end();
	}
};

export const getMe = async (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	try {
		const userId = getUserIdFromRequest(req);
		const user = await User.findOne({ _id: userId });
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ errors: [error] });
	}
};

export const update = async (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	const userId = getUserIdFromRequest(req);

	try {
		await User.updateOne({ _id: userId }, req.body);
		res.status(200).end();
	} catch (error) {
		res.status(500).json({ errors: [error] });
	}
};

export const updateBehanceCredentials = async (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	const {
		behanceAccessToken,
		behanceCookie,
	}: { behanceAccessToken: string; behanceCookie: string } = req.body;
	if (!behanceAccessToken || !behanceCookie) {
		return res.status(400).end();
	}

	let userId: Types.ObjectId;
	try {
		userId = Types.ObjectId(req.params.id);
	} catch (error) {
		res.status(400).send({ errors: [error] });
		return;
	}

	try {
		await User.updateOne(
			{ _id: userId },
			{ behanceAccessToken, behanceCookie }
		);
		res.status(200).send();
	} catch (error) {
		res.status(500).json({ errors: [error] });
	}
};
