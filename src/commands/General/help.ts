import { PaginatedFieldMessageEmbed, PaginatedMessage } from '@sapphire/discord.js-utilities';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';
import { client } from '../..';
import { createInfoEmbed } from '../../utils/createInfoEmbed';
import { toWords } from 'number-to-words'

export class HelpCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'help',
            aliases: [],
            description: 'How to use the bot.',
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
                idHints: ['925762459988533318']
            })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const commands = this.container.stores.get("commands");
        const categories = commands.categories
        // console.log(commands?.options.name, commands?.options.description, commands?.options.enabled)

        const paginated = new PaginatedMessage({ template: createInfoEmbed(client, { title: "Help" }) })
            .setSelectMenuOptions((pageIndex) => ({ label: categories[pageIndex - 1], description: `Page ${pageIndex}` }));

        for (const category of categories) {
            const fields: { name: string; value: any; }[] = [];

            commands.filter(c => String(c.fullCategory) == category).forEach(command => {
                fields.push({
                    name: `/${command.name}`,
                    value: command.detailedDescription || command.description
                })
            })

            paginated.addPageEmbed(createInfoEmbed(client, { title: `${category} Commands`, fields }));;
        }

        const message = await interaction.user.send('**Help Menu** - Use the buttons below to navigate the help menu. One category per page. You may not have access to all the commands shown.');
        await paginated.run(message, interaction.user);

        interaction.editReply({ content: 'Check your DM\'s!' });
    }
}
