import Agenda from 'agenda';
import agenda from '../config/agenda';
import { AgendaJobAttributeData, AgendaJobName } from '../models/Agenda';

export const scheduleJob = (
	name: AgendaJobName,
	when: Date,
	data: AgendaJobAttributeData
): Promise<Agenda.Job<AgendaJobAttributeData>> => {
	const job = agenda.create(name, data);
	job.schedule(when);
	return job.save();
};
