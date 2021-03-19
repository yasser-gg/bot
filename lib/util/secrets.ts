export const SESSION_SECRET = '9r5Ba$VGPEoXrXvY$@MgFWUhsyq54#cjw!6';
export const MONGODB_URI =
`mongodb+srv://${process.env.MONGO_USER}:${
	process.env.MONGO_PASSWORD
  }@cluster0-ntrwp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
export const JWT_SECRET = 'z2x6oQJ#BqWTvnEM2upUME4%x#Sg*9X39&P';
