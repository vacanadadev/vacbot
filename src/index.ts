import { config } from 'dotenv';
import { VACClient } from './lib/VACClient';
config();

const client = new VACClient();

export { client }

client.on('ready', () => {
    console.log('Ready!');
})

client.login(process.env.TOKEN);