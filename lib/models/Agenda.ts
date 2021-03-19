import mongoose from 'mongoose';

export enum AgendaJobName {
	AppreciateProject = 'appreciateProject',
	FollowUser = 'followUser',
	UnfollowUser = 'unfollowUser',
	FollowEveryProjectOwner = 'followEveryProjectOwner',
	PostComment = 'postComment',
	UpdateBehanceUserStats = 'updateBehanceUserStats',
	ScheduleEveryDayJob = 'scheduleEveryDayJob',
	ScheduleJobs = 'scheduleJobs',
}

export type AgendaJobAttributeData =
	| AppreciateProjectJobAttributesData
	| FollowUserJobAttributesData
	| PostCommentJobAttributesData
	| UpdateBehanceUserStatsJobAttributesData
	| ScheduleEveryDayJobJobAttributeData;

export interface AppreciateProjectJobAttributesData {
	projectId: number;
	sub: JobAttributesSubjectData;
}

export interface FollowUserJobAttributesData {
	id: number;
	sub: JobAttributesSubjectData;
}

export interface UnfollowUserJobAttributesDate
	extends FollowUserJobAttributesData {}

export interface PostCommentJobAttributesData {
	projectId: number;
	comment: string;
	sub: JobAttributesSubjectData;
}

export interface UpdateBehanceUserStatsJobAttributesData {
	behanceUserId: number;
	sub: JobAttributesSubjectData;
}

export interface ScheduleEveryDayJobJobAttributeData {
	sub: JobAttributesSubjectData;
}

export interface ScheduleJobsJobAttributeData {
	sub: JobAttributesSubjectData;
}

export interface JobAttributesSubjectData {
	id: mongoose.Types.ObjectId;
	behanceEmail?: string;
}
