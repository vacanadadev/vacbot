import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class OwnerOnlyPrecondition extends Precondition {
    public run(message: Message) {
        return message.author.id === process.env.OWNER_ID
            ? this.ok()
            : this.error({ message: 'Only the bot owner can use this command!' });
    }
}