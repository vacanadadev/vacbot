import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';
import { mainMYSQL } from '../../utils';

export class RegisterCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'register',
            aliases: [],
            description: 'Registers your discord account with MyVAC.',
            detailedDescription: 'Registers your discord account with MyVAC. This is required for the bot to work. The verrification code can be retrieved using the instructions in #terminal.',
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            type: 'CHAT_INPUT',
            options: [
                {
                    name: 'code',
                    type: 'STRING',
                    description: 'The verrification code that can be found in MyVAC.',
                    required: true
                }
            ]
        },
            {
                guildIds: [process.env.SERVER_ID || ''],
                idHints: []
            })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        await interaction.reply({ content: `Registering...`, ephemeral: true });

        var vacID = `${parseInt(interaction.options.getString('code') || '', 16) * 3 / 9}`;

        switch (vacID.length) {
            case 5:
                vacID = '0' + vacID;
                break;
            case 4:
                vacID = '00' + vacID;
                break;
            case 2:
                vacID = '0' + vacID;
                break;
            case 1:
                vacID = '00' + vacID;
                break;
        };

        vacID = 'VAC' + vacID;

        mainMYSQL.query(`SELECT pid, hub, discord_id, first_name, last_name, rank FROM pilots WHERE pid LIKE \'${vacID}\'`, (error, result) => {
            if (error) {
                this.container.logger.error(error);
                return interaction.editReply('Sorry, there was an error!');
            };
            let vacIDResult = result[0];
            if (!result || !vacIDResult) {
                return interaction.editReply(`Sorry, could not find a user with that ID. Make sure your verification code is correct.`)
            };

            mainMYSQL.query(`UPDATE pilots SET discord_id = \'${interaction.user.id}\' WHERE pid = \'${vacID}\'`, (error, result) => {
                mainMYSQL.query(`SELECT pid, hub, discord_id, first_name, last_name, rank FROM pilots WHERE pid LIKE \'${vacID}\'`, async (error, result) => {
                    if (error) {
                        this.container.logger.error(error);
                        interaction.editReply('Sorry, there was an error!');
                    };

                    if (result) {
                        vacIDResult = result[0];
                        const registerEmbed = {
                            title: 'Registration:',
                            author: {
                                name: this.container.client.user?.username,
                                icon_url: 'https://cdn.discordapp.com/icons/407578094698889237/f3882269092c5b5c3a830b10c1bcad43.webp?size=128',
                                url: 'https://vacanada.org'
                            },
                            fields: [
                                {
                                    name: 'Welcome!',
                                    inline: false,
                                    value: `It worked, you're in! Feel free to come say hi in ${this.container.client.channels.cache.get(process.env.GENERAL_CHANNEL_ID || '')}`
                                },
                                {
                                    name: 'Your Info:',
                                    inline: false,
                                    value: `This is the information that I was able to get from our database. If this is wrong, please open a support ticket in ${this.container.client.channels.cache.get(process.env.SUPPORT_CHANNEL_ID || '')}.\n**NAME:** ${vacIDResult.first_name} ${vacIDResult.last_name}\n**HUB:** ${vacIDResult.hub}\n**VAC ID:** ${vacIDResult.pid}\n**DISCORD ACCOUNT:** <@${vacIDResult.discord_id}>`
                                }
                            ],
                            footer: {
                                text: `© VAC, 1998-${new Date().getFullYear()}`
                            }
                        }

                        const member = await this.container.client.guilds.cache.get(process.env.SERVER_ID || '')?.members.fetch(interaction.user.id).catch(() => { });

                        member?.setNickname(`${vacIDResult.pid} - ${vacIDResult.first_name} ${vacIDResult.last_name}`).catch(error => {
                            this.container.logger.warn(`Error while changing nickname:\n${error}`);
                        });
                        interaction.user.send({ embeds: [registerEmbed] }).catch(error => { });

                        const guild = this.container.client.guilds.cache.get(process.env.SERVER_ID || '');

                        let CYUL = guild?.roles.cache.get('578683605996273664');
                        let CYVR = guild?.roles.cache.get('578683441831215115');
                        let CYWG = guild?.roles.cache.get('578683837064675328');
                        let CYYZ = guild?.roles.cache.get('578683757121503279');
                        let Pilot = guild?.roles.cache.get('859924904915763210');

                        switch (vacIDResult.hub) {
                            case 'CYYZ':
                                if (!member?.roles.cache.has(CYYZ?.id || '')) {
                                    await member?.roles.add(CYYZ || '').catch(error => this.container.logger.error(error));
                                }
                                break;
                            case 'CYVR':
                                if (!member?.roles.cache.has(CYVR?.id || '')) {
                                    await member?.roles.add(CYVR || '').catch(error => this.container.logger.error(error));
                                }
                                break;
                            case 'CYUL':
                                if (!member?.roles.cache.has(CYUL?.id || '')) {
                                    await member?.roles.add(CYUL || '').catch(error => this.container.logger.error(error));
                                }
                                break;
                            case 'CYWG':
                                if (!member?.roles.cache.has(CYWG?.id || '')) {
                                    await member?.roles.add(CYWG || '').catch(error => this.container.logger.error(error));
                                }
                                break;
                        };

                        // console.log("member", member, 'pilot', Pilot)

                        await member?.roles.add(Pilot || '').catch(error => this.container.logger.error(error));


                        this.container.logger.info(`New member: ${interaction.user.tag} - ${vacIDResult.pid} ${vacIDResult.hub}`)
                    }
                })
            });
        });

        return await interaction.editReply(`Registered!`);
    }
}