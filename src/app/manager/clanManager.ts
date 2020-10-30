import { Clan } from '../object/clan';
import { ClanListService } from '../service/clanListService';
import { Api } from '../util/api';
import { Util } from '../util/util';

/**
 * Manages the Discord requests related to clan information.
 */
export class ClanManager {
    private readonly _okUpdate = 'Successfully completed operation. Member data will be updated on next check.';

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
     * Helper function to simply remove any invalid clans from the list of clans.
     *
     * @param clanList
     *      The list of clans that needs to be cleaned of invalid entries
     * @param invalidClans
     *      The list of invalid entries to be removed
     * @private
     */
    private static removeInvalids(clanList: string[], invalidClans: string[]): string[] {
        for (const id of invalidClans) {
            clanList.splice(clanList.indexOf(id), 1);
        }

        return clanList;
    }

    /**
     * A helper function that validates clans that are being added against Wargaming's API.
     *
     * @param clansToAdd
     *      The array of clans to sanitize
     * @param api
     *      The API endpoint prefix to use
     * @param appId
     *      The application id to enable access to the API
     * @returns
     *      A list of invalid clans found
     * @private
     */
    private static async validateClanList(clansToAdd: string[], api: string, appId: string) {
        const clansToCheck = sanitizeResult.valid;
        const invalidClans = [];

        if (!clansToCheck.length) {
            return { valid: clansToAdd, invalid: invalidClans.concat(sanitizeResult.invalid) };
        }

        const clanData = await Api.chunkedApiCall(clansToCheck, `${api}/wot/clans/info/`, 'clan_id',
            'clan_id', appId);

        for (const id in clanData) {
            if (clanData[id] === null) {
                invalidClans.push(id);
            }
        }

        clansToAdd = ClanManager.removeInvalids(clansToCheck, invalidClans);

        return { valid: clansToAdd, invalid: invalidClans.concat(sanitizeResult.invalid) };
    }

    /**
     * Adds the given clans to the list of tracked clans.
     * Output is expected to be Discord safe.
     *
     * @param clansToAdd
     *      An array representing the ids of clans to add to the list of tracked clans
     * @returns
     *      An object which includes the result JSON and an array of invalid clans
     */
    public async addNewClans(clansToAdd: string[]): Promise<string[]> {
        if (!clansToAdd.length) {
            return Util.discordify(['No clans supplied.']);
        }

        // Make sure only inputs consisting solely of numbers, and remove any duplicates
        const sanitizedInput: string[] = clansToAdd.filter((clanId: string) => /^[0-9]*$/.test(clanId))
            .filter(clanId => this._clanListService.clanList.findIndex(clan => clan.id === parseInt(clanId, 10)) === -1);

        // TODO: At this point, we have all the numeric inputs that do not exist in the current tracked list.
        //  The next step is to ensure they are actually valid clans based on the data from the api call

        const clanData = await Api.chunkedApiCall(sanitizedInput, `${this._api}/wot/clans/info/`, 'clan_id',
            'tag', this._appId);

        if (clanData.result) {
            return Util.discordify([clanData.result]);
        }

        // TODO: Notify if there are no valid clans

        const sanitizeResult = await ClanManager.validateClanList(clansToAdd, this._api, this._appId);
        const output: string[] = [];

        clansToAdd = sanitizeResult.valid;
        const invalidClans = sanitizeResult.invalid;

        if (!clansToAdd.length) {
            output.push('No valid clans. Nothing added');
            output.push(invalidClans.toString().replace(',', ', '));
            return Util.discordify(output);
        }

        // TODO: Retrieve clan tags as well
        for (const clanId of clansToAdd) {
            this._clanListService.clanList.push(new Clan(parseInt(clanId, 10), null));
        }

        this._clanListService.updateSavedList();

        validClans.unshift('Successfully added:');
        return Util.discordify(validClans);
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
    public async removeExistingClans(clansToRemove: string[]): Promise<string[]> {
        if (!clansToRemove.length) {
            return Util.discordify(['No clans supplied.']);
        }

        // Filter out any non-numeric only inputs, and determine if they are in the currently tracked list
        const validClans: string[] = clansToRemove.filter(clanId => /^[0-9]*$/.test(clanId))
            .filter(clanId => this._clanListService.clanList.findIndex(clan => clan.id === parseInt(clanId, 10)) !== -1);

        if (!validClans.length) {
            return Util.discordify(['None of the requested clans are tracked.']);
        }

        for (const clanId of validClans) {
            const index = this._clanListService.clanList.findIndex(clan => clan.id === parseInt(clanId, 10));
            this._clanListService.clanList.splice(index, 1);
        }

        this._clanListService.updateSavedList();

        validClans.unshift('Successfully removed:');
        return Util.discordify(validClans);
    }

    /**
     * Provides a user readable list of all clans currently being tracked.
     * Output is expected to be Discord safe.
     *
     * @returns
     *      An array containing the tag and id for each of the tracked clans
     */
    public async showClanList(): Promise<string[]>  {
        const readableClanList: string[] = [];

        for (const clan of this._clanListService.clanList) {
            readableClanList.push(clan.getClanInfo());
        }

        return Util.discordify(readableClanList);
    }
}
