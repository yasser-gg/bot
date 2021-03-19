export interface BehanceUser {
	id: number;
	first_name: string;
	last_name: string;
	username: string;
	city: string;
	state: string;
	country: string;
	location: string;
	company: string;
	occupation: string;
	created_on: number;
	url: string;
	display_name: string;
	fields: string[];
	has_default_image: number;
	website: string;
	banner_image_url: string;
	stats: Stats;
}

export interface Stats {
	followers?: number;
	following?: number;
	appreciations?: number;
	views?: number;
	comments?: number;
}
