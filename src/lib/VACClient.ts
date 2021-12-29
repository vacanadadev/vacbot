import { LogLevel, SapphireClient } from "@sapphire/framework";

export class VACClient extends SapphireClient {
    constructor(options?: object) {
        super({
            ...options,
            intents: 14335,
            caseInsensitiveCommands: true,
            defaultCooldown: {
                delay: 5000,
                limit: 3
            },
            typing: true,
            logger: { level: LogLevel.Debug }
        });
    }
}