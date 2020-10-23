/**
 * Utility class for miscellaneous helper methods
 */
export abstract class Util {
    /**
     * Helper function for assigning the correct values for the various regions. Used for completing API URL
     *
     * @param region
     *      The server specified in the config that the data will work off of
     * @returns
     *      The necessary top level domain information
     */
    public static determineRegionValues(region: string): string {
        switch (region.toLowerCase()) {
            case 'na':
                return '.com';
            case 'eu':
                return '.eu';
            case 'ru':
                return '.ru';
            case 'sea':
                return '.asia';
            default:
                throw new Error('Invalid region selected');
        }
    }

    /**
     * Converts the incoming array into a Discord safe message format.
     * Escapes underscores (_) and limits messages to the message maximum character limit
     *
     * @param messageArray
     *      The array of raw output messages produced
     * @return
     *      An array with Discord safe messages
     */
    public static discordify(messageArray: string[]): string[] {

        return;
    }

    // const CHAR_LIMIT = 1850; // Discord has a 2000 character limit. 1850 is to be safe
    // // TODO: Split this into another function. It is the only section to have significant
    // //  logic in the command branch, making it very messy looking
    // let reply = '';
    // for (const playerId in list) {
    //     let playerAndClan = `${list[playerId].nickname} left ${list[playerId].clan}`;
    //     playerAndClan = playerAndClan.replace(/_/g, '\\\_');
    //     reply += `${playerAndClan}\n${list[playerId].status}\n`;
    //
    //     // Break it up into multiple messages to avoid breaking Discord
    //     if (reply.length > CHAR_LIMIT) {
    //         message.channel.send(reply);
    //         reply = '';
    //     }
    // }
    //
    // message.channel.send(reply);
}
