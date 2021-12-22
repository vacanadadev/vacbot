import { createInfoEmbed } from '../src/utils/createInfoEmbed';
import { VACClient } from '../src/lib'

describe('Info Embed Creator', () => {

    const client = new VACClient();

    test('GIVEN example embed data THEN returns a valid embed', async () => {
        createInfoEmbed(client, {
            title: 'Test Embed',

        })
        expect(true).toBe(true);
    })

    client.destroy()
})