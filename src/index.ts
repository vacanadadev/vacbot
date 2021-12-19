import { SapphireClient } from '@sapphire/framework';
import { config } from 'dotenv';
config();

const client = new SapphireClient({
    intents: 14335,
    caseInsensitiveCommands: true,
    defaultCooldown: {
        delay: 5000,
        limit: 3
    },
    typing: true,
});

export { client }

client.on('ready', () => {
    console.log('Ready!');
})

client.login(process.env.TOKEN);