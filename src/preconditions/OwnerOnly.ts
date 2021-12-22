import { Precondition } from '@sapphire/framework';
import type { Interaction, Message } from 'discord.js';

export class OwnerOnlyPrecondition extends Precondition {
    public chatInputRun(interaction: Interaction) {
        return interaction.user.id === process.env.OWNER_ID
            ? this.ok()
            : this.error({ message: 'Only the bot owner can use this command!', identifier: 'OWNER_ONLY' });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        OwnerOnly: never;
    }
}