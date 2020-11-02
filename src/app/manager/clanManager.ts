import { Clan } from '../object/clan';
import { ClanListService } from '../service/clanListService';
import { Api } from '../util/api';
import { Util } from '../util/util';

/**
 * Manages the Discord requests related to clan information.
 */
export class ClanManager {
    private readonly _okUpdate = '\nPlayer data will be updated on next check.';

    /**
     * @param _api
     *      The api endpoint to use
     * @param _appId
     *      The application ID used with the Wargaming API
     * @param _clanListService
     *      The service that handles the list of tracked clans
     */
    constructor(private readonly _api: string,
                private readonly _appId: string,
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
        const sanitizedInput: number[] = clansToAdd.filter((clanId: string) => /^[0-9]*$/.test(clanId))
            .map(clanId => parseInt(clanId, 10))
            .filter(clanId => this._clanListService.getClanList().findIndex(clan => clan.id === clanId) === -1);

        let newClans: Clan[] = [];

        // If there are valid clans, make an api call
        if (!!sanitizedInput.length) {
            const clanData = await Api.chunkedApiCall(sanitizedInput, `${this._api}/wot/clans/info/`, 'clan_id',
                'tag', this._appId);

            if (clanData.result) {
                return Util.discordify([clanData.result]);
            }

            newClans = sanitizedInput.filter(clanId => clanData[clanId] !== null)
                .map(clanId => new Clan(clanId, clanData[clanId].tag));
        }

        if (!newClans.length) {
            return Util.discordify(['None of the requested clans are valid.']);
        }

        const response: string[] = this._clanListService.addTrackedClans(newClans);
        response.unshift('Successfully added:');
        response.push(this._okUpdate);
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

        const clanList = this._clanListService.getClanList();

        // Filter out any non-numeric only inputs, and determine if they are in the currently tracked list
        // TODO: It would be nice to pull the clan object, and send the list of them... But, then it would also be
        //  nice to utilize set features like delete, since we would already have the correctly referenced object
        const validClans: number[] = Array.from(clansToRemove).filter(clanId => /^[0-9]*$/.test(clanId))
            .filter(clanId => clanList.findIndex(clan => clan.id === parseInt(clanId, 10)) !== -1)
            .map(clanId => parseInt(clanId, 10));

        if (!validClans.length) {
            return Util.discordify(['None of the requested clans are valid.']);
        }

        const response: string[] = this._clanListService.removeTrackedClans(validClans);
        response.unshift('Successfully removed:');
        response.push(this._okUpdate);
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
        const readableClanList: string[] = this._clanListService.getClanList().map(clan => clan.getClanInfo());
        return Util.discordify(readableClanList);
    }
}
