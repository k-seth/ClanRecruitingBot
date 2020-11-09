import { Clan } from '../object/clan';
import { Player } from '../object/player';
import { ClanListService } from '../service/clanListService';
import { ConfigService } from '../service/configService';
import { Api } from '../util/api';
import { Util } from '../util/util';

/**
 * Manages the Discord requests related to clan information.
 */
export class ClanManager {
    /**
     * @param _configService
     *      The service that handles program configuration
     * @param _clanListService
     *      The service that handles the list of tracked clans
     */
    constructor(private readonly _configService: ConfigService,
                private readonly _clanListService: ClanListService
    ) {
    }

    /**
     * Adds the given clans to the list of tracked clans.
     * Output is expected to be Discord safe.
     *
     * @param clansToAdd
     *      An array representing the ids of clans to add to the list of tracked clans
     * @returns
     *      An array with the response message(s)
     */
    public async addClans(clansToAdd: string[]): Promise<string[]> {
        if (!clansToAdd.length) {
            return Util.discordify(['No clans supplied.']);
        }

        // Make sure only inputs consisting solely of numbers and are not already tracked
        const validClans: number[] = clansToAdd.filter((clanId: string) => /^[0-9]*$/.test(clanId))
            .map(clanId => parseInt(clanId, 10))
            .filter(clanId => !this._clanListService.getClanList().has(clanId));

        if (!validClans.length) {
            return Util.discordify(['None of the requested clans are valid.']);
        }

        const response: string[] = await this._clanListService.addClans(validClans);
        response.unshift('Successfully added:');
        return Util.discordify(response);
    }

    /**
     * Removes the given clans from the list of tracked clans.
     * Output is expected to be Discord safe.
     *
     * @param clansToRemove
     *      An array representing the ids of the clans to remove from the list of tracked clans
     * @returns
     *      An array containing the result of the removal action
     */
    public async removeClans(clansToRemove: string[]): Promise<string[]> {
        if (!clansToRemove.length) {
            return Util.discordify(['No clans supplied.']);
        }

        // Filter out any non-numeric only inputs, and determine if they are in the currently tracked list
        const validClans: number[] = clansToRemove.filter(clanId => /^[0-9]*$/.test(clanId))
            .map(clanId => parseInt(clanId, 10))
            .filter(clanId => this._clanListService.getClanList().has(clanId));

        if (!validClans.length) {
            return Util.discordify(['None of the requested clans are valid.']);
        }

        const response: string[] = this._clanListService.removeClans(validClans);
        response.unshift('Successfully removed:');
        return Util.discordify(response);
    }

    /**
     * Provides a user readable list of all clans currently being tracked.
     * Output is expected to be Discord safe.
     *
     * @returns
     *      An array of Discord message(s) containing the info of each tracked clan
     */
    public showClanList(): string[] {
        const clans: Clan[] = Array.from(this._clanListService.getClanList().values());

        const readableClanList: string[] = clans.map(clan => clan.getClanInfo());
        return Util.discordify(readableClanList);
    }
}
