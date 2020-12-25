import { ServerError } from '../error/ServerError';

/**
 * Utility class for miscellaneous helper methods
 */
export abstract class Util {
    /**
     * Helper function for assigning the correct values for the various regions. Used for completing API URL
     *
     * @param server
     *      The server specified in the config that the data will work off of
     * @return
     *      The necessary top level domain information
     */
    public static determineApiDomain(server: string): string {
        switch (server.toLowerCase()) {
        case 'na':
            return '.com';
        case 'eu':
            return '.eu';
        case 'ru':
            return '.ru';
        case 'sea':
            return '.asia';
        default:
            throw new ServerError('Invalid server selected');
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
                discordMessages.push(message.replace(/_/g, '\\_'));
                message = '';
            }
            message += `${ text }\n`;
        }

        discordMessages.push(message.replace(/_/g, '\\_'));
        return discordMessages;
    }

    /**
     * Provides the help message
     *
     * @param prefix
     *      The prefix used by the bot
     * @param commands
     *      The commands available to the bot
     * @return
     *      The array of help messages for the bot
     */
    public static help(prefix: string, commands: Map<string, string>): string[] {
        const output: string[] = [];

        output.push('**Clan Recruitment Bot Help:**');
        output.push('Full documentation available at https://github.com/k-seth/ClanRecruitingBot/wiki');
        output.push(' ');
        output.push('Commands for using the bot');
        output.push(`${ prefix }${ commands.get('check') }: Update player data and post to Discord. This is the main command.`);
        output.push(`${ prefix }${ commands.get('seed') }: Get fresh data. Does not post to Discord. Use this if there is a data error.`);
        output.push(`${ prefix }${ commands.get('add') } [ID] [ID]: Add new clan(s). Use one or more clan ids at a time. `);
        output.push(`${ prefix }${ commands.get('remove') } [ID] [ID]: Remove existing clan(s). Use one or more clan ids at a time.`);
        output.push(`${ prefix }${ commands.get('list') }: Shows the list of tracked clans.`);
        output.push(' ');
        output.push('Trouble shooting: https://github.com/k-seth/ClanRecruitingBot#trouble-shooting');

        return output;
    }
}

export enum PlayerStatus {
    Active = 'Active',
    BelowReqs = 'Below Requirements',
    Inactive = 'Inactive'
}
