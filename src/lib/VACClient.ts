import { SapphireClient, SapphireClientOptions } from "@sapphire/framework";

export class VACClient extends SapphireClient {
    constructor(options?: SapphireClientOptions) {
        super({
            ...options,
            intents: 14335,
            caseInsensitiveCommands: true,
            defaultCooldown: {
                delay: 5000,
                limit: 3
            },
            typing: true,
        });
    }
}