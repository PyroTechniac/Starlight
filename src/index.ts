import { StarlightClient } from './lib/StarlightClient';

const { TOKEN: token } = process.env;

new StarlightClient().login(token);
