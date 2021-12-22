import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

export class SlowmodeCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'slowmode',
            aliases: [],
            description: 'Sets the slowmode of the channel.',
            detailedDescription: 'Sets the slowmode of the channel. Can only be used by moderators.',
            preconditions: ['GuildOnly'],
            requiredUserPermissions: ['MANAGE_CHANNELS'],
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
                name: 'time',
                description: 'The time (in seconds) to set the slowmode to. (0 to disable)',
                required: true
            }]
        },
            {
                guildIds: ['921757111548018748'],
                idHints: ['923269920148574279']
            })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const time = interaction.options.getNumber('time') || 0;

        if (interaction.channel?.type !== 'GUILD_TEXT') return;

        if (time > 21600 || time < 0) {
            return await interaction.editReply({ content: 'The time to set the slowmode to must be from 0-21600.' })
        }

        interaction.channel?.setRateLimitPerUser(time || 0);

        interaction.editReply({ content: `Set slowmode to ${time} seconds.` });
    }
}