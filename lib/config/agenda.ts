import { MONGODB_URI } from '../util/secrets';
import { User } from '../models/User';
import {
	AgendaJobName,
	AppreciateProjectJobAttributesData,
	PostCommentJobAttributesData,
	FollowUserJobAttributesData,
	UpdateBehanceUserStatsJobAttributesData,
	ScheduleEveryDayJobJobAttributeData,
	UnfollowUserJobAttributesDate,
} from '../models/Agenda';
import {
	appreciateProject,
	postComment,
	followUser,
	fetchUser,
	getProjects,
	unfollowUser,
} from '../util/behance';

import Agenda from 'agenda';
import { UserEvents } from '../models/UserEvents';
import { BehanceUserStats } from '../models/BehanceUserStats';
import { getRandomInt } from '../util/misc';
import { scheduleJob } from '../util/agenda';
import { comments } from '../util/comments';
import { checkBehanceAccessTokenExpired } from '../util/jwt';

const agenda = new Agenda({
	db: { address: MONGODB_URI },
});

agenda.define(
	AgendaJobName.AppreciateProject,
	async (job: Agenda.Job<AppreciateProjectJobAttributesData>) => {
		const user = await User.findById(job.attrs.data.sub.id);
		if (
			!user ||
			checkBehanceAccessTokenExpired(user.behanceAccessToken ?? '')
		)
			return;

		await appreciateProject(user, job.attrs.data.projectId);

		await UserEvents.updateOne(
			{ userId: job.attrs.data.sub.id },
			{
				userId: job.attrs.data.sub.id,
				$push: {
					appreciateProject: {
						id: job.attrs.data.projectId,
						when: new Date(),
					},
				},
			},
			{ upsert: true }
		);
	}
);

agenda.define(
	AgendaJobName.PostComment,
	async (job: Agenda.Job<PostCommentJobAttributesData>) => {
		const user = await User.findById(job.attrs.data.sub.id);
		if (
			!user ||
			checkBehanceAccessTokenExpired(user.behanceAccessToken ?? '')
		)
			return;

		await postComment(
			user,
			job.attrs.data.projectId,
			job.attrs.data.comment
		);

		await UserEvents.updateOne(
			{ userId: job.attrs.data.sub.id },
			{
				userId: job.attrs.data.sub.id,
				$push: {
					postComment: {
						projectId: job.attrs.data.projectId,
						when: new Date(),
						comment: job.attrs.data.comment,
					},
				},
			},
			{ upsert: true }
		);
	}
);

agenda.define(
	AgendaJobName.FollowUser,
	async (job: Agenda.Job<FollowUserJobAttributesData>) => {
		const user = await User.findById(job.attrs.data.sub.id);
		if (
			!user ||
			checkBehanceAccessTokenExpired(user.behanceAccessToken ?? '')
		)
			return;

		await followUser(user, job.attrs.data.id);

		await UserEvents.updateOne(
			{ userId: job.attrs.data.sub.id },
			{
				userId: job.attrs.data.sub.id,
				$push: {
					followUsers: {
						ids: [job.attrs.data.id],
						when: new Date(),
					},
				},
			},
			{ upsert: true }
		);

		const unfollowDate = new Date();
		unfollowDate.setDate(
			unfollowDate.getDate() + user.filters?.unfollowAfterDays ?? 3
		);
		scheduleJob(AgendaJobName.UnfollowUser, unfollowDate, job.attrs.data);
	}
);

agenda.define(
	AgendaJobName.UnfollowUser,
	async (job: Agenda.Job<UnfollowUserJobAttributesDate>) => {
		const user = await User.findById(job.attrs.data.sub.id);
		if (!user) return;
		if (checkBehanceAccessTokenExpired(user.behanceAccessToken ?? '')) {
			const newDate = new Date();
			newDate.setDate(newDate.getDate() + 1);
			scheduleJob(AgendaJobName.UnfollowUser, newDate, job.attrs.data);
			return;
		}

		await unfollowUser(user, job.attrs.data.id);

		await UserEvents.updateOne(
			{ userId: job.attrs.data.sub.id },
			{
				userId: job.attrs.data.sub.id,
				$push: {
					unfollowUser: {
						id: job.attrs.data.id,
						when: new Date(),
					},
				},
			},
			{ upsert: true }
		);
	}
);

agenda.define(
	AgendaJobName.UpdateBehanceUserStats,
	async (job: Agenda.Job<UpdateBehanceUserStatsJobAttributesData>) => {
		const user = await fetchUser(job.attrs.data.behanceUserId);

		await BehanceUserStats.updateOne(
			{ userId: job.attrs.data.sub.id },
			{
				userId: job.attrs.data.sub.id,
				$push: {
					statsHistory: {
						when: new Date(),
						stats: user.stats,
					},
				},
			},

			{ upsert: true }
		);
	}
);

agenda.define(
	AgendaJobName.ScheduleEveryDayJob,
	async (job: Agenda.Job<ScheduleEveryDayJobJobAttributeData>) => {
		const newJob = agenda.create(
			AgendaJobName.ScheduleJobs,
			job.attrs.data
		);
		newJob.repeatEvery('24 hours');
		newJob.save();
	}
);

agenda.define(
	AgendaJobName.ScheduleJobs,
	async (job: Agenda.Job<ScheduleEveryDayJobJobAttributeData>) => {
		const user = await User.findById(job.attrs.data.sub.id);
		if (!user) return;

		const projects = await getProjects(
			user,
			(user?.filters?.creativeField as string).toLowerCase()
		);

		let totalFollowedOwners: number = 0;
		const totalOwnersPlannedToFollow = getRandomInt(
			user?.filters?.followersCountRange[0] ?? 15,
			user?.filters?.followersCountRange[1] ?? 30
		);

		let lastScheduledJobDate = new Date();

		for (let project of projects) {
			console.log(`project: ${project.id}`);
			try {
				const projectPauseDuration = getRandomInt(
					user?.filters?.pauseBetweenProjectsInSecondsRange[0] ?? 10,
					user?.filters?.pauseBetweenProjectsInSecondsRange[1] ?? 20
				);
				lastScheduledJobDate.setSeconds(
					lastScheduledJobDate.getSeconds() + projectPauseDuration
				);
				const appreciateData: AppreciateProjectJobAttributesData = {
					projectId: project.id,
					sub: job.attrs.data.sub,
				};
				await scheduleJob(
					AgendaJobName.AppreciateProject,
					lastScheduledJobDate,
					appreciateData
				);

				lastScheduledJobDate.setSeconds(
					lastScheduledJobDate.getSeconds() + getRandomInt(3, 7)
				);

				if (project.owners.length == 1) {
					const followData: FollowUserJobAttributesData = {
						id: project.owners[0].id,
						sub: job.attrs.data.sub,
					};
					await scheduleJob(
						AgendaJobName.FollowUser,
						lastScheduledJobDate,
						followData
					);
				}

				lastScheduledJobDate.setSeconds(
					lastScheduledJobDate.getSeconds() + getRandomInt(4, 10)
				);
				const comment = comments[getRandomInt(0, comments.length - 1)];
				const commentData: PostCommentJobAttributesData = {
					sub: job.attrs.data.sub,
					projectId: project.id,
					comment: comment,
				};
				await scheduleJob(
					AgendaJobName.PostComment,
					lastScheduledJobDate,
					commentData
				);

				totalFollowedOwners += project.owners.length;
			} catch (error) {
				console.log(
					`Could not schedule actions for project ${project.id}`
				);
			}

			if (totalFollowedOwners >= totalOwnersPlannedToFollow) {
				break;
			}
		}
	}
);

export default agenda;
