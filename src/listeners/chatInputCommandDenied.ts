import { ChatInputCommandDeniedPayload, Command, Listener, UserError } from '@sapphire/framework';
import { CommandInteraction, Interaction } from 'discord.js';
import { VACClient } from '../lib';

export class ChatInputCommandDeniedListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: 'chatInputCommandDenied'
        });
    }

    public run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        payload.interaction.reply({ content: `${error.message} (Error: \`${error.identifier}\`)`, ephemeral: true });
    }

}
