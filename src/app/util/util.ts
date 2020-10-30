import { RegionError } from '../error/RegionError';

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
                throw new RegionError('Invalid region selected');
        }
    }

    /**
     * Converts the incoming array into a Discord safe message format.
     * Escapes underscores (_) and limits messages to the message maximum character limit.
     * Any message being sent to Discord should come through this to prevent unexpected behaviour in future changes.
     *
     * @param messageArray
     *      The array of raw output messages produced
     * @return
     *      An array with Discord safe messages
     */
    public static discordify(messageArray: string[]): string[] {
        // Discord has a 2000 character limit. 1850 is to be safe
        const MAX_SIZE = 1850;
        const discordMessages: string[] = [];

        let message = '';
        for (const text of messageArray) {
            if (message.length > MAX_SIZE) {
                discordMessages.push(message);
                message = '';
            }
            message += `${text.replace(/_/g, '\\\_')}\n`;
        }

        discordMessages.push(message);
        return discordMessages;
    }
}

export enum PlayerStatus {
    Active = 'Active',
    BelowReqs = 'Below Requirements',
    Inactive = 'Inactive'
}
