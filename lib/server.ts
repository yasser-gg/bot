import errorHandler from 'errorhandler';

import app from './config/app';
import agenda from './config/agenda';
import {
	AgendaJobName,
	UpdateBehanceUserStatsJobAttributesData,
} from './models/Agenda';
import { User, UserDocument } from './models/User';

// Agenda dashboard
const Agendash = require('agendash');
app.use('/dash', Agendash(agenda));

// Provides full stack
app.use(errorHandler());

const server = app.listen(app.get('port'), () => {
	console.log(`App is running at http://localhost:${app.get('port')}`);
});
agenda.start();

User.find().then(async (users: UserDocument[]) => {
	const updateBehanceUserStatsRepeatingJobs = await agenda.jobs<
		UpdateBehanceUserStatsJobAttributesData
	>({
		name: AgendaJobName.UpdateBehanceUserStats,
		repeatInterval: { $exists: true },
	});

	for (const user of users) {
		if (
			updateBehanceUserStatsRepeatingJobs.some(
				job => job.attrs.data.sub.id == user.id
			)
		) {
			continue;
		}

		const data: UpdateBehanceUserStatsJobAttributesData = {
			behanceUserId: user.behanceUserId,
			sub: { id: user._id },
		};
		const job = agenda.create(AgendaJobName.UpdateBehanceUserStats, data);
		job.repeatEvery('5 minutes').save();
	}
});

export default server;
