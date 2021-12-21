import { Client, MessageEmbed } from "discord.js";

export function createInfoEmbed(client: Client, options: { title: string, description?: string, timestamp?: number, fields?: { name: string, value: string }[] }) {
    return new MessageEmbed()
        .setTitle(options.title)
        .setDescription(options.description || '')
        .setFooter(`© VAC, 1998-${new Date().getFullYear()}`)
        .setAuthor(client.user?.username || '', client.user?.displayAvatarURL({ size: 128 }))
        .setFields(options.fields || [])
        .setTimestamp(options.timestamp || Date.now())
        .setColor('#eb1c24');
}