import { Guild } from "discord.js";
import { VACClient } from "../lib";

export async function updateMembers(guildId: string, client: VACClient) {
    const guild = await client.guilds.cache.get(guildId);

    const memberCount = Number(guild?.memberCount) - 1;

    if (memberCount === 1) {
        client.user?.setActivity(`vacanada.org`, { type: 'WATCHING' });
    } else {
        client.user?.setActivity(`vacanada.org`, { type: 'PLAYING' })
    }

    return;
}