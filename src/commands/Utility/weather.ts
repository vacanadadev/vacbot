import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';
import superagent from 'superagent';
import { client } from '../..';
import { createInfoEmbed } from '../../utils/createInfoEmbed';

export class WeatherCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'weather',
            aliases: [],
            description: 'Fetches the weather (METAR or TAF) for a given location.',
            detailedDescription: 'Fetches the weather (METAR or TAF) for a given location. Can be returned in a private message.',
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
                idHints: ['923769775958679583']
            })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        let { options } = interaction;
        const station = options.getString('icao')?.toUpperCase();

        await interaction.deferReply({ ephemeral: options.getBoolean('private') || false });

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
                            if (err == 'Error: Bad Request') {
                                return interaction.editReply({ content: `Invalid ICAO code: \`${station}\`` });
                            }
                            return interaction.editReply({ content: `${err}` });
                        }
                        if (res.body.error) {
                            return interaction.editReply({ content: `${res.body.error}!` });
                        }
                        if (res.body) {
                            const { body } = res;
                            const { translate } = body;

                            let remarksArray = [];
                            const translateRemarks = Object.keys(translate.remarks).map((key) => [(key), translate.remarks[key]]);
                            for (let i = 0; i < translateRemarks.length; i++) {
                                const remark = translateRemarks[i];
                                remarksArray.push(`*${remark[0]}*: ${remark[1]}`);
                            }

                            let remarks = remarksArray == [] ? 'No Remarks' : remarksArray.join('\n');

                            let metarEmbed = createInfoEmbed(client, {
                                title: `METAR`, fields: [
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
                                timestamp: Number(new Date(res.body.time.dt))
                            });

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
                            if (err == 'Error: Bad Request') {
                                return interaction.editReply({ content: `Invalid ICAO code: \`${station}\`` });
                            }
                            return interaction.editReply({ content: `${err}` });
                        }
                        if (res.body.error) {
                            return interaction.editReply({ content: `${res.body.error}` });
                        }
                        if (res.body) {

                            const { body } = res;

                            let forcasts = body.forecast.slice(0, 4);
                            let readableRaw = '';
                            for (let i = 0; i < forcasts.length; i++) {
                                const fc = forcasts[i];
                                readableRaw = `${readableRaw}${fc.sanitized}\n`
                            }

                            let tafEmbed = createInfoEmbed(client, {
                                title: `TAF`, fields: [
                                    {
                                        name: `${station} TAF`,
                                        value: readableRaw
                                    },
                                ],
                                timestamp: Number(new Date(res.body.time.dt))
                            })

                            return interaction.editReply({ embeds: [tafEmbed] });
                        }
                    })
                break;


        }
    }
}