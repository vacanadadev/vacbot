import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { config } from 'dotenv';
import { VACClient } from './lib';
config();

export const client = new VACClient();

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

client.on('ready', () => {
    console.log('Ready!');
})

client.login(process.env.TOKEN);