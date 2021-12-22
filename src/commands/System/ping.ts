import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';

export class PingCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'ping',
            aliases: [],
            description: 'Ping Pong! (Tests the bot\'s latency).',
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            type: 'CHAT_INPUT'
        },
            {
                guildIds: ['921757111548018748'],
                idHints: ['921762487748145232']
            })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        await interaction.reply({ content: `Ping...`, ephemeral: true });

        const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${Date.now() - interaction.createdTimestamp}ms.`;

        return await interaction.editReply(content);
    }
}