import { Listener } from '@sapphire/framework';
import { Client, GuildMember } from 'discord.js';
import { createInfoEmbed, scheduleJobs, updateMembers } from '../utils';

export class GuildMemberAddListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: 'guildMemberAdd'
        });
    }

    public async run(member: GuildMember) {
        const client = this.container.client
        const guild = await client.guilds.cache.get(process.env.SERVER_ID || '')
        updateMembers(guild?.id || '', client)

        if (member.user.bot) return;

        const welcomeEmbed = createInfoEmbed(client, {
            title: 'Welcome!',
            description: 'Welcome to the Official Virtual Air Canada Discord Server! Please read the info below on how to connect your VAC account to your Discord and gain access to the wonderful server awaiting you!',
        })

        const policyEmbed = createInfoEmbed(client, {
            title: 'Policies',
            description: 'These rules and policies must be followed at all times while in the VAC Discord server.',
            fields: [
                {
                    name: '1) No Member Bias:',
                    value: 'Access to this server is availible to all individuals regardless of race, creed, colour, nationality, sexuality, gender or disability.'
                },
                {
                    name: '2) Registration:',
                    value: 'Once you have joined the server, you have 24h (twenty-four hours) to register your Discord account and VAC ID with the Discord bot. After 24h, we reserve the right to auto-kick you from the server.'
                },
                {
                    name: '3) Copyright:',
                    value: 'Members are NOT permitted to post any copyrighted material or links to such material in the VAC Discord Server. The definition of copyrighted material shall include software, published articles, real world non-public airline information, pictures which do not belong to the member, in addition to any other information that Virtual Air Canada management may deem from time to time to be classified as copyright.'
                },
                {
                    name: '4) Usage:',
                    value: 'The VAC Discord Server are to be used for general discussion of the airline industry only. Topics that do not fall under this definition can be removed without warning from management. Topics, which discuss religion, politics, race and other controversial agendas, are not permitted, and will be removed by the forum moderators. VAC management reserves the right to remove any topic that is deemed inappropriate.\nMembers will not use the VAC Discord Server to post, distribute, or disseminate defamatory, infringing, obscene, or other unlawful material, images, text, or information. Such posts will be removed, and members warned. Repeat offences may result in a possible suspension or termination of the member’s account.'
                },
                {
                    name: '5) VAC Image Protection:',
                    value: 'To protect the VAC image, members are not permitted to post any information, which may cause harm to the image and reputation of VAC. Such information or disputes should be directed toward VAC management in private, and dealt with in private. Forum moderators will immediately remove any defamatory information about VAC, and the member will be warned. Repeat offences may lead to suspension of the members account or termination.'
                },
                {
                    name: '6) Competition Protection:',
                    value: 'Members may not provide links to any competitor Virtual Airline. Such links will be removed by server moderators, and a warning will be sent to the offending member. Repeat offences may result in a possible suspension or termination of the member’s account'
                },
                {
                    name: '7) NSFW:',
                    value: 'Members will not post language that sounds like or contains: profanity sexual content (including but not limited to explicit language, sexual innuendo, sexual content, and references to sexual preferences), slurs (including but not limited to racial, ethnic, and religious slurs), illegal drugs/controlled substances, and illegal activities. This shall include the use of wildcards to emulate the above. Such posts will be edited by server moderators, and a warning will be sent to the offending member. Repeat offences may result in a possible suspension or termination of the member’s account.'
                },
                {
                    name: '8) Harassment:',
                    value: 'Threatening or harassing any member will result in immediate suspension, and possible termination of the offender.'
                },
                {
                    name: '9) Non-profit:',
                    value: 'VAC is a non-profit organization and does not charge any fees to apply for or to retain membership in the organization including the forums. No member of VAC may request money or charge fees as a prerequisite to offering any assistance or product. In addition, no member is permitted to resell or make any commercial or non-commercial use of the VAC website or forums. The prohibitions set forth in this paragraph expressly include any and all sales and/or solicitations of money, goods and services no matter for what purpose, person, group or cause, without limitation. Members violating these rules may be subject to immediate termination from VAC'
                },
                {
                    name: '10) Moderation:',
                    value: 'VAC moderators reserves the right to temporarily suspend or terminate an individual\'s membership from the forums without notification if certain rules have been violated.The member may appeal the suspension or termination to the President or the CEO, whose decision shall be final.'
                }
            ]
        });

        const registerEmbed = createInfoEmbed(client, {
            title: 'Registration',
            description: `To gain access to the Official VAC Discord server, and register your Discord account with the bot, please run /register command in ${guild?.channels.cache.get(process.env.REGISTER_CHANNEL_ID || '')?.toString()} channel. Your verification code can be found by following the instructions in that channel.`,
        });

        const welcomeChannel = await client.channels.cache.get(process.env.WELCOME_CHANNEL_ID || '');
        if (welcomeChannel?.type !== 'GUILD_TEXT') return;

        await welcomeChannel.send(`**✅ | <@${member.id}> Has Joined** | *Welcome! Please read the message sent to you by <@${client.user?.id}>.*`);
        await member.send({ embeds: [welcomeEmbed, policyEmbed, registerEmbed] }).catch(error => { });

    }
}