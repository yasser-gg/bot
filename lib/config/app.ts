import express from 'express';
import session from 'express-session';
import cors from 'cors';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { MONGODB_URI, SESSION_SECRET } from '../util/secrets';

import * as userController from '../controllers/user';
import * as botController from '../controllers/bot';
import * as userEventsControlelr from '../controllers/user_events';
import * as userStatsController from '../controllers/user_stats';
import morgan from 'morgan';
import { authenticationMiddleware } from '../util/jwt';

const MongoStore = mongo(session);

const app: express.Application = express();

mongoose
	.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		/* ready to use. The `mongoose.connect()` promise resolves to undefined. */
	})
	.catch(err => {
		console.log(`MongoDB connection error. ${err}`);
	});

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(cors());
app.use(
	session({
		secret: SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		store: new MongoStore({
			url: MONGODB_URI,
			autoReconnect: true,
		}),
	})
);
app.use(morgan('tiny'));

app.post('/login', userController.login);
app.put('/me', authenticationMiddleware, userController.update);
app.put(
	'/users/:id/behance-credentials',
	userController.updateBehanceCredentials
);
app.get(
	'/me/events',
	authenticationMiddleware,
	userEventsControlelr.getMyEvents
);
app.get('/me/stats', authenticationMiddleware, userStatsController.getMyStats);
app.get('/me', authenticationMiddleware, userController.getMe);
app.post('/me/start', authenticationMiddleware, botController.start);
app.post('/me/stop', authenticationMiddleware, botController.stop);

export default app;
