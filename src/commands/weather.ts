import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';
import superagent from 'superagent';
import { client } from '..';

export class WeatherCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'weather',
            aliases: ['metar', 'taf'],
            description: 'Fetches the weather for a given location',
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            type: 'CHAT_INPUT',
            options: [
                {
                    name: 'metar',
                    type: 'SUB_COMMAND',
                    description: 'Fetches the METAR for a given location',
                    options: [
                        {
                            name: 'icao',
                            type: 'STRING',
                            description: 'The ICAO code for the location',
                            required: true
                        },
                        {
                            name: 'private',
                            type: 'BOOLEAN',
                            description: 'Whether or not to return the METAR in a private message',
                            required: false
                        }
                    ]
                },
                {
                    name: 'taf',
                    type: 'SUB_COMMAND',
                    description: 'Fetches the TAF for a given location',
                    options: [
                        {
                            name: 'icao',
                            type: 'STRING',
                            description: 'The ICAO code for the location',
                            required: true
                        },
                        {
                            name: 'private',
                            type: 'BOOLEAN',
                            description: 'Whether or not to return the TAF in a private message',
                            required: false
                        }
                    ]
                },
            ]
        },
            {
                guildIds: ['921757111548018748'],
                idHints: ['922108112394158110']
            })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        let { options } = interaction;
        const station = options.getString('icao')?.toUpperCase();

        await interaction.reply({ content: `Fetching ${options.getSubcommand().toUpperCase()} for \`${station}\`... ⌛`, ephemeral: options.getBoolean('private') || false }); // Sends temporary message to user to indicatge that the command is running

        if (station?.length !== 4) {
            return await interaction.editReply({ content: `Invalid ICAO code: \`${station}\`` });
        }

        switch (options.getSubcommand()) {
            case 'metar':
                superagent
                    .get(`https://avwx.rest/api/metar/${station}?options=translate&token=${process.env.AVWX_TOKEN}`)
                    .send()
                    .end((err, res) => {
                        if (err) {
                            return interaction.editReply({ content: `${err}` });
                        }
                        if (res.body.error) {
                            return interaction.editReply({ content: `${res.body.error}` });
                        }
                        if (res.body) {
                            let timestamp1 = new Date(res.body.time.dt).toUTCString();
                            let timestamp = (new Date(new Date(res.body.time.dt).toUTCString()).getTime() / 1000).toFixed(0);

                            const { body } = res;
                            const { translate } = body;

                            let remarksArray = [];
                            const translateRemarks = Object.keys(translate.remarks).map((key) => [(key), translate.remarks[key]]);
                            for (let i = 0; i < translateRemarks.length; i++) {
                                const remark = translateRemarks[i];
                                remarksArray.push(`*${remark[0]}*: ${remark[1]}`);
                            }

                            let remarks = remarksArray == [] ? 'No Remarks' : remarksArray.join('\n');

                            let metarEmbed = {
                                title: `METAR`,
                                author: {
                                    name: client.user?.username,
                                    icon_url: 'https://cdn.discordapp.com/icons/407578094698889237/f3882269092c5b5c3a830b10c1bcad43.webp?size=128s',
                                    url: 'https://vacanada.org',
                                },
                                fields: [
                                    {
                                        name: `${station} METAR`,
                                        value: `${body.sanitized}`
                                    },
                                    {
                                        name: `${station} METAR - Translated`,
                                        value: `*Wind*: ${translate.wind}
                                        *Altimeter*: ${translate.altimeter}
                                        *Clouds*: ${translate.clouds || ''}
                                        *Weather Code(s)*: ${translate.wx_codes || ''}
                                        *Visibility*: ${translate.visibility}
                                        *Temperature*: ${translate.temperature}
                                        *Dewpoint*: ${translate.dewpoint}
                                        *Remarks*: ${remarks}`
                                    }
                                ],
                                footer: {
                                    text: `© VAC, 1998-${new Date().getFullYear()}`
                                }
                            };

                            return interaction.editReply({ embeds: [metarEmbed] });

                        }
                    })
                break;
            case 'taf':
                superagent
                    .get(`https://avwx.rest/api/taf/${station}?options=translate&token=${process.env.AVWX_TOKEN}`)
                    .send()
                    .end((err, res) => {
                        if (err) {
                            return interaction.editReply({ content: `${err}` });
                        }
                        if (res.body.error) {
                            return interaction.editReply({ content: `${res.body.error}` });
                        }
                        if (res.body) {
                            let timestamp1 = new Date(res.body.time.dt).toUTCString();
                            let timestamp = (new Date(new Date(res.body.time.dt).toUTCString()).getTime() / 1000).toFixed(0);

                            const { body } = res;

                            let forcasts = body.forecast.slice(0, 4);
                            let readableRaw = '';
                            for (let i = 0; i < forcasts.length; i++) {
                                const fc = forcasts[i];
                                readableRaw = `${readableRaw}${fc.sanitized}\n`
                            }

                            let tafEmbed = {
                                title: `TAF`,
                                author: {
                                    name: client.user?.username,
                                    icon_url: 'https://cdn.discordapp.com/icons/407578094698889237/f3882269092c5b5c3a830b10c1bcad43.webp?size=128s',
                                    url: 'https://vacanada.org',
                                },
                                fields: [
                                    {
                                        name: `${station} TAF`,
                                        value: readableRaw
                                    },
                                ],
                                footer: {
                                    text: `© VAC, 1998-${new Date().getFullYear()}`
                                }
                            }

                            return interaction.editReply({ embeds: [tafEmbed] });
                        }
                    })
                break;


        }
    }
}