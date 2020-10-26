import { ClanListService } from '../service/clanListService';
import { Api } from '../util/api';
import { Util } from '../util/util';

/**
 * A class that provides an interface for manipulating the list of tracked clans
 */
export class ClanManager {
    private readonly OK_UPDATE = 'Successfully completed operation. Member data will be updated on next check';

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
     * Helper function to simply remove any invalid clans from the list of clans
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
     * A helper function that checks for and removes any clans that do not contain only numbers.
     * Does not check if the clan is valid, just that it will not break the API
     *
     * Split from validateClanList to enable isolated regex testing
     *
     * @param clanList
     *      The array of clans to sanitize
     * @return
     *      A list of invalid clans found
     * @private
     */
    private static sanitizeClanId(clanList: string[]): {valid: string[], invalid: string[]} {
        const clansToCheck = clanList;
        const invalidClans = [];

        for (const id of clansToCheck) {
            if (!/^[0-9]*$/.test(id)) {
                invalidClans.push(id);
            }
        }

        clanList = ClanManager.removeInvalids(clansToCheck, invalidClans);

        return { valid: clanList, invalid: invalidClans };
    }

    /**
     * A helper function that validates clans that are being added against Wargaming's API
     *
     * @param clanList
     *      The array of clans to sanitize
     * @param api
     *      The API endpoint prefix to use
     * @param appId
     *      The application id to enable access to the API
     * @returns
     *      A list of invalid clans found
     * @private
     */
    private static async validateClanList(clanList: string[], api: string, appId: string) {
        const sanitizeResult = ClanManager.sanitizeClanId(clanList);

        const clansToCheck = sanitizeResult.valid;
        const invalidClans = [];

        if (!clansToCheck.length) {
            return { valid: clanList, invalid: invalidClans.concat(sanitizeResult.invalid) };
        }

        const clanData = await Api.chunkedApiCall(clansToCheck, `${api}/wot/clans/info/`, 'clan_id',
            'clan_id', appId);

        for (const id in clanData) {
            if (clanData[id] === null) {
                invalidClans.push(id);
            }
        }

        clanList = ClanManager.removeInvalids(clansToCheck, invalidClans);

        return { valid: clanList, invalid: invalidClans.concat(sanitizeResult.invalid) };
    }

    /**
     * Adds the given clans to the list of tracked clans
     *
     * @param clansToAdd
     *      An array representing the ids of clans to add to the list of tracked clans
     * @returns
     *      An object which includes the result JSON and an array of invalid clans
     */
    public async addNewClans(clansToAdd: string[]): Promise<{result: string, invalid: string[]}> {
        const sanitizeResult = await ClanManager.validateClanList(clansToAdd, this._api, this._appId);

        clansToAdd = sanitizeResult.valid;
        const invalidClans = sanitizeResult.invalid;

        if (!clansToAdd.length) {
            return { result: 'No valid clans. Nothing added', invalid: invalidClans };
        }

        for (const id of clansToAdd) {
            const clanId = parseInt(id);
            // TODO: Switch to findIndex
            if (this._clanListService.clanList.indexOf(clanId) === -1) {
                this._clanListService.clanList.push(clanId);
                continue;
            }
            invalidClans.push(clanId);
        }

        this._clanListService.updateSavedList();

        return { result: this.OK_UPDATE, invalid: invalidClans };
    }

    /**
     * Removes the given clans from the list of tracked clans
     *
     * @param clansToRemove
     *      An array representing the ids of the clans to remove from the list of tracked clans
     * @returns
     *      An array which includes the result JSON and an array of invalid clans
     */
    public async removeExistingClans(clansToRemove: string[]): Promise<{result: string, invalid: string[]}> {
        const invalidClans: string[] = [];

        for (const id of clansToRemove) {
            const clanId = parseInt(id, 10);
            // TODO: Switch to findIndex
            const index = this._clanListService.clanList.indexOf(clanId);

            index === -1 ? invalidClans.push(clanId) : this._clanListService.clanList.splice(index, 1);
        }

        this._clanListService.updateSavedList();

        return { result: this.OK_UPDATE, invalid: invalidClans };
    }

    /**
     * Provides a user readable list of all clans currently being tracked
     *
     * @returns
     *      An array containing a string that includes the tag and id for each of the tracked clans
     */
    public async showClanList(): Promise<string[]>  {
        const readableClanList: string[] = [];

        // TODO: Covert to one (or more if they exceed like 100 clans) message contained in an array
        for (const clan of this._clanListService.clanList) {
            readableClanList.push(clan.getClanInfo());
        }

        return Util.discordify(readableClanList);
    }
}
