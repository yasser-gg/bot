import mongoose from 'mongoose';

export type UserDocument = mongoose.Document & {
	email: string;
	behanceUserId: number;
	behanceAccessToken?: string;
	behanceCookie?: string;
	name: string;
	surname: string;
	avatarUrl: string;
	password: string;

	isBotRunning: boolean;

	filters: {
		creativeField: string;
		followersCountRange: [number, number];
		dayPeriodInMinutesRange: [number, number];
		pauseBetweenProjectsInSecondsRange: [number, number];
		unfollowAfterDays: number;
	};
};

const userSchema = new mongoose.Schema({
	email: { type: String, unique: true },
	behanceUserId: Number,
	behanceAccessToken: String,
	behanceCookie: String,
	password: String,

	name: String,
	surname: String,
	avatarUrl: String,

	isBotRunning: Boolean,

	filters: {
		creativeField: String,
		followersCountRange: [Number, Number],
		dayPeriodInMinutesRange: [Number, Number],
		pauseBetweenProjectsInSecondsRange: [Number, Number],
		unfollowAfterDays: Number,
	},
});

export const User = mongoose.model<UserDocument>('User', userSchema);
