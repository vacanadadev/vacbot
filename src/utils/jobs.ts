import { VACClient } from "../lib";
import { scheduleJob } from 'node-schedule';
import mysql from 'mysql'
export const mainMYSQL = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_UNAME,
    password: process.env.MYSQL_PASS,
    database: 'vacanada_aviation'
});


export function scheduleJobs(client: VACClient) {
    // schedule.scheduleJob('* * * * *', () => {});
    const onDutyRole = client.guilds.cache.get(process.env.SERVER_ID || '')?.roles.cache.find(r => r.id === '859582871185129482');

    setInterval(() => {
        const { updateMembers } = require('./status');
        updateMembers(client.guilds.cache.get(process.env.SERVER_ID || ''), client);
    }, 60000)

    setInterval(async () => {
        mainMYSQL.query(`SELECT pid, status FROM dispatch_live WHERE status = 1`, async (error: any, results: string | any[]) => {
            if (error) {
                return console.error(error)
            }

            for (let i = 0; i < results.length; i++) {
                let discord_id;
                mainMYSQL.query(`SELECT pid, discord_id FROM pilots WHERE pid = \'${results[i].pid}\'`, async (error: any, results2: { discord_id: any; }[]) => {
                    discord_id = results2[0].discord_id;

                    if (!discord_id)
                        return;

                    const member = await client.guilds.cache.get(process.env.SERVER_ID || '')?.members.fetch(discord_id).catch(() => { });

                    if (!member || member.user.bot)
                        return;

                    await member.roles.add(onDutyRole || '');
                })

            }
        })

        mainMYSQL.query(`SELECT pid, status FROM dispatch_live WHERE status = 0`, async (error: any, results: string | any[]) => {
            if (error) {
                return console.error(error)
            }

            for (let i = 0; i < results.length; i++) {
                let discord_id;
                mainMYSQL.query(`SELECT pid, discord_id FROM pilots WHERE pid = \'${results[i].pid}\'`, async (error: any, results2: { discord_id: any; }[]) => {
                    discord_id = results2[0] ? results2[0].discord_id : null;

                    if (!discord_id)
                        return;

                    const member = await client.guilds.cache.get(process.env.SERVER_ID || '')?.members.fetch(discord_id).catch(() => { });

                    if (!member || member.user.bot)
                        return;

                    await member.roles.remove(onDutyRole || '');
                })


            }
        })
    }, 30000)

    scheduleJob('@hourly', async () => {
        const channel = await client.guilds.cache.get(process.env.SERVER_ID || '')?.channels.fetch(process.env.REGISTER_CHANNEL_ID || '')

        if (channel?.type !== 'GUILD_TEXT') return;

        await channel?.bulkDelete(99)

        await channel?.send({ content: 'To register, please run the following command and replace \`abc123\` with the verification code you got on MyVAC (instructions below): \`.register abc123\`. Please note that it may take up to a few minutes before your roles are added. The discord api gets a lot of traffic and can be slow sometimes.', files: [{ name: 'verificationCode.png', attachment: 'https://docs.google.com/uc?export=download&id=1IYkZ9YiHPiq0TWf7uzGsbixCEh6kxqmp' }] });
    });

}