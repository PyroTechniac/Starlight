import { StarlightClient } from './lib/StarlightClient';

const { TOKEN: token } = process.env;
const client = new StarlightClient();

client.login(token)
	.catch((err): void => client.console.error(err));
