import axios from 'axios';
import { UserDocument } from '../models/User';
import { BehanceProject } from '../models/BehanceProject';
import { BehanceUser } from '../models/BehanceUser';

const createDefaultHeaders = (user: UserDocument): object => {
	const cookieObj: Map<string, any> = new Map<string, any>();
	user?.behanceCookie?.split(/\s*;\s*/)?.forEach(pair => {
		const pairParts = pair.split(/\s*=\s*/);
		cookieObj.set(pairParts[0], pairParts.splice(1).join('='));
	});

	return {
		Authorization: `Bearer ${user.behanceAccessToken}`,
		'X-Requested-With': 'XMLHttpRequest',
		'X-BCP': cookieObj.get('bcp'),
		'Content-Type': 'application/json',
		cookie: user.behanceCookie,
	};
};

export const getProjects = async (
	user: UserDocument,
	creativeField: string
): Promise<BehanceProject[]> => {
	const url = `https://www.behance.net/search?content=projects&field=${creativeField}&sort=published_date`;
	const res = await axios.get(url, {
		headers: {
			...createDefaultHeaders(user),
			Referer: url,
		},
	});
	console.log(`getProjects: ${res.status}`);

	const projects = res.data?.search?.content?.projects as BehanceProject[];

	return projects ?? [];
};

export const appreciateProject = async (
	user: UserDocument,
	projectId: number
): Promise<boolean> => {
	const url = `https://www.behance.net/v2/projects/${projectId}/appreciate`;
	const res = await axios.post(url, null, {
		headers: createDefaultHeaders(user),
	});
	console.log(
		`appreciateProject: ${res.status} ; ${JSON.stringify(res.data)}`
	);

	return res.status == 200 && res.data.valid;
};

export const followUser = async (
	user: UserDocument,
	userId: number,
	trackingSource: string = 'search_projects_published_date'
): Promise<boolean> => {
	const url = `https://www.behance.net/relations/user/${userId}?tracking_source=${trackingSource}`;
	const res = await axios.post(url, null, {
		headers: createDefaultHeaders(user),
	});
	console.log(`followUser: ${res.status} ; ${JSON.stringify(res.data)}`);

	return res.data == 200;
};

export const unfollowUser = async (
	user: UserDocument,
	userId: number
): Promise<boolean> => {
	const url = `https://www.behance.net/relations/user/${userId}`;
	const res = await axios.delete(url, {
		headers: createDefaultHeaders(user),
	});
	console.log(`unfollowUser: ${res.status} ; ${JSON.stringify(res.data)}`);

	return res.data == 200;
};

export const postComment = async (
	user: UserDocument,
	projectId: number,
	comment: string
): Promise<{ success: boolean; comment: object }> => {
	const url = 'https://www.behance.net/comments/project';
	const res = await axios.post(
		url,
		{ comment, entity_id: projectId },
		{ headers: createDefaultHeaders(user) }
	);
	return { success: res.status == 200, comment: res.data };
};

export const fetchUser = async (userId: number): Promise<BehanceUser> => {
	const url = `https://www.behance.net/v2/users/${userId}?format=mini&client_id=BehanceWebSusi1`;
	const res = await axios.get(url);
	return res.data?.user;
};
