import { UiCoreMcpServer } from './server.js';

const rootDirectory = process.argv[2] ?? process.cwd();
const server = new UiCoreMcpServer({ rootDirectory });

server.start();
