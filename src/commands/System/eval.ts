import { ApplicationCommandRegistry, Command, RegisterBehavior } from '@sapphire/framework';
import { ApplicationCommandPermissionData, CommandInteraction, Message } from 'discord.js';
import { client } from '../../index';

export class EvalCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'eval',
            aliases: [],
            description: 'Runs code in the bot\'s environment. Only for developers.',
        });
    }

    public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
        await registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            type: 'CHAT_INPUT',
            defaultPermission: false,
            options: [
                {
                    type: 'STRING',
                    name: 'code',
                    description: 'The code to evaluate.',
                    required: true,
                },
                {
                    type: 'BOOLEAN',
                    name: 'private',
                    description: 'Whether to send the result in a private message.',
                    required: false,
                }
            ]
        },
            {
                guildIds: ['921757111548018748'],
                idHints: ['921762487290957855'],
            })

        // setTimeout(async () => {
        const command = await client.guilds.cache.get('921757111548018748')?.commands.fetch('921762487290957855');
        // console.log(command)

        const permissions: ApplicationCommandPermissionData[] = [
            {
                id: process.env.OWNER_ID || '',
                type: 'USER',
                permission: true,
            },
        ];
        await command?.permissions.set({ permissions });
        // }, 2000)

    }

    public async chatInputRun(interaction: CommandInteraction) {
        await interaction.reply({
            content: `Evaluating... ⌛`,
            ephemeral: interaction.options.getBoolean('private') ? true : false,
        });
        const code = interaction.options.getString('code')?.toString() || '';

        console.warn(`[REMOTE EVAL]: ${code}`);

        let content = `Code Evaluated: \`\`\`js\n${code}\n\`\`\`\n\nResult:`;

        try {
            const result = await eval(code);
            content += `\n\`\`\`js\n${result}\n\`\`\``;
        } catch (error) {
            content += `\n\`\`\`js\n${error}\n\`\`\``;
        } finally {
            await interaction.editReply(content);
        }
    }
}