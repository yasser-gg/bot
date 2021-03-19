import mongoose from 'mongoose';
import { Stats } from './BehanceUser';

export type BehanceUserStatsDocument = mongoose.Document & {
	userId: mongoose.Types.ObjectId;

	statsHistory: {
		when: Date;
		stats: Stats;
	}[];
};

const userStatsSchema = new mongoose.Schema({
	userId: mongoose.Types.ObjectId,

	statsHistory: [
		{
			when: Date,
			stats: {
				followers: Number,
				following: Number,
				appreciations: Number,
				views: Number,
				comments: Number,
			},
		},
	],
});

export const BehanceUserStats = mongoose.model<BehanceUserStatsDocument>(
	'UserStatistics',
	userStatsSchema,
	'stats'
);
