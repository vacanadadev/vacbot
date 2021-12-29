import { Precondition } from '@sapphire/framework';
import type { Interaction, Message } from 'discord.js';

export class ModeratorOnlyPrecondition extends Precondition {
    public chatInputRun(interaction: Interaction) {
        const user = interaction.user
        const guild = interaction.guild
        const member = guild?.members.cache.get(user.id)

        return member?.roles.cache.has(process.env.MODERATOR || '')
            ? this.ok()
            : this.error({ message: 'Only moderators can use this command!', identifier: 'MODERATOR_ONLY' });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        ModeratorOnly: never;
    }
}