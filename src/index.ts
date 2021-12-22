import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { config } from 'dotenv';
import { VACClient } from './lib';
config();

export const client = new VACClient();

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

client.login(process.env.TOKEN);