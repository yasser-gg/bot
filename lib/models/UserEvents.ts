import mongoose from 'mongoose';

export type UserEventsDocument = mongoose.Document & {
	userId: mongoose.Types.ObjectId;

	followUsers: { ids: number[]; when: Date; projectId?: number }[];
	appreciateProject: { id: number; when: Date }[];
	unfollowUser: { id: number; when: Date }[];
	postComment: { projectId: number; when: Date; comment: string }[];
};

const userEventsSchema = new mongoose.Schema({
	userId: mongoose.Types.ObjectId,

	followUsers: [{ ids: [Number], when: Date, projectId: Number }],
	appreciateProject: [{ id: Number, when: Date }],
	unfollowUser: [{ id: Number, when: Date }],
	postComment: [{ projectId: Number, when: Date, comment: String }],
});

export const UserEvents = mongoose.model<UserEventsDocument>(
	'UserEvents',
	userEventsSchema,
	'userEvents'
);
