import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import type { ApplicationCommandPermissionData, CommandInteraction, Message } from 'discord.js';
import { client } from '../..';

export class ClearCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'clear',
            aliases: [],
            description: '[EN/FR] Clears the channel of messages || Efface les messages du canal',
            detailedDescription: '[EN/FR] Clears the channel of the specified amount of messages. Can only be used by moderators on messages younger than 2 weeks. || Efface le canal de la quantité spécifiée de messages. Peut seulement être utilisé par les modérateurs sur les messages de moins de 2 semaines.',
            preconditions: ['GuildOnly'],
            requiredUserPermissions: ['MANAGE_MESSAGES'],
        });
    }

    public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            type: 'CHAT_INPUT',
            defaultPermission: true,
            options: [{
                type: 'NUMBER',
                name: 'amount',
                description: 'The amount of messages to delete (max: 99). || Le nombre de messages à supprimer (max : 99).',
                required: true
            }]
        },
            {
                guildIds: [process.env.SERVER_ID || ''],
                idHints: []
            })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const amount = interaction.options.getNumber('amount');
        const channel = interaction.channel;

        if (channel?.type !== 'GUILD_TEXT') return

        if (!amount || amount > 99 || amount < 1) {
            return await interaction.editReply({ content: 'The amount of messages to delete must be from 1-99. || Le nombre de messages à supprimer doit être compris entre 1 et 99.' })
        }

        await channel?.bulkDelete(amount).then((messages) => {
            const mAmount = messages.size;

            interaction.editReply({ content: `Deleted ${mAmount} message${mAmount !== 1 ? 's' : ''}. || Supprimé ${mAmount} message${mAmount !== 1 ? 's' : ''}.` });
        })
    }
}