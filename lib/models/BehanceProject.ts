import { BehanceUser } from './BehanceUser';

export interface BehanceProject {
	id: number;
	name: string;
	published_on: number;
	created_on: number;
	modified_on: number;
	url: string;
	slug: string;
	privacy: string;
	fields: string[];
	covers: Covers;
	mature_content: number;
	mature_access: string;
	owners: BehanceUser[];
	stats: Stats;
	conceived_on: number;
	colors: Color[];
}

export interface Covers {
	'115': string;
	'202': string;
	'230': string;
	'404': string;
	'808': string;
	original: string;
	max_808: string;
}

export interface Stats {
	views: number;
	appreciations: number;
	comments: number;
}

export interface Color {
	r: number;
	g: number;
	b: number;
}
