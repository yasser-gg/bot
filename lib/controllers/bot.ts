import { User, UserDocument } from '../models/User';
import { Request, Response } from 'express';
import {
	AgendaJobName,
	ScheduleEveryDayJobJobAttributeData,
} from '../models/Agenda';
import { getRandomInt } from '../util/misc';
import { scheduleJob } from '../util/agenda';
import agenda from '../config/agenda';
import { getUserIdFromRequest } from '../util/jwt';

export const scheduleEveryDayJob = async (user: UserDocument) => {
	const timeOfDayInMinutes = getRandomInt(
		user?.filters?.dayPeriodInMinutesRange[0] ?? 60 * 12,
		user?.filters?.dayPeriodInMinutesRange[1] ?? 60 * 14
	);
	const hours = ~~(timeOfDayInMinutes / 60);
	const minutes = timeOfDayInMinutes - hours * 60;
	const now = new Date();
	const hasTimeOfDayPassed =
		hours <= now.getHours() && minutes < now.getMinutes();

	const lastScheduledJobDate: Date = new Date(
		now.getFullYear(),
		now.getMonth(),
		!hasTimeOfDayPassed ? now.getDate() : now.getDate() + 1,
		hours,
		minutes
	);

	const scheduleJobData: ScheduleEveryDayJobJobAttributeData = {
		sub: {
			id: user?.id,
			behanceEmail: user?.email,
		},
	};

	await scheduleJob(
		AgendaJobName.ScheduleEveryDayJob,
		lastScheduledJobDate,
		scheduleJobData
	);
};

export const start = async (req: Request, res: Response) => {
	const userId = getUserIdFromRequest(req);

	let user: UserDocument | null;
	try {
		user = await User.findOne({ _id: userId });
		if (!user) {
			res.status(400).json({ errors: ['User not found'] });
		}
	} catch (error) {
		res.status(500).json({ errors: [error] });
		return;
	}

	try {
		await scheduleEveryDayJob(user as UserDocument);
	} catch (error) {
		res.status(500).json({ errors: [error] });
		return;
	}

	await User.updateOne({ _id: userId }, { $set: { isBotRunning: true } });

	res.status(200).end();
};

export const stop = async (req: Request, res: Response) => {
	const userId = getUserIdFromRequest(req);

	await agenda.cancel({
		name: {
			$in: [
				AgendaJobName.ScheduleEveryDayJob,
				AgendaJobName.ScheduleJobs,
			],
		},
		'data.sub.id': userId.toHexString(),
	});

	await User.updateOne({ _id: userId }, { $set: { isBotRunning: false } });

	res.status(200).end();
};
