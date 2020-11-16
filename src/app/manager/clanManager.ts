import { ApiService } from '../service/apiService';
import { Clan } from '../object/clan';
import { ClanListService } from '../service/clanListService';
import { ConfigService } from '../service/configService';

/**
 * Manages the Discord requests related to clan information.
 */
export class ClanManager {
    /**
     * @param _apiService
     *      The service that handles api transactions
     * @param _configService
     *      The service that handles program configuration
     * @param _clanListService
     *      The service that handles the list of tracked clans
     */
    constructor(private readonly _apiService: ApiService,
                private readonly _configService: ConfigService,
                private readonly _clanListService: ClanListService
    ) {
    }

    /**
     * Adds the given clans to the list of tracked clans.
     *
     * @param clansToAdd
     *      An array representing the ids of clans to add to the list of tracked clans
     * @returns
     *      An array with the response message(s)
     */
    public async addClans(clansToAdd: string[]): Promise<string[]> {
        if (!clansToAdd.length) {
            return ['No clans supplied.'];
        }

        // Make sure only inputs consisting solely of numbers and are not already tracked
        const validClans: number[] = clansToAdd.filter((clanId: string) => /^[0-9]*$/.test(clanId))
            .map(clanId => parseInt(clanId, 10))
            .filter(clanId => !this._clanListService.getClanList().has(clanId));

        if (!validClans.length) {
            return ['None of the requested clans are valid.'];
        }

        let clanData: Map<number, Clan>;
        try {
            clanData = await this._apiService.fetchClanData(validClans);
        } catch (error) {
            return [error.message] as string[];
        }

        if (!clanData.size) {
            return ['None of the requested clans are valid.'];
        }

        const action: string[] = ['Successfully added:'];
        const response: Map<number, Clan> = this._clanListService.addClans(clanData);
        const output = Array.from(response.values()).map(clan => clan.getClanInfo());
        return action.concat(output);
    }

    /**
     * Removes the given clans from the list of tracked clans.
     *
     * @param clansToRemove
     *      An array representing the ids of the clans to remove from the list of tracked clans
     * @returns
     *      An array containing the result of the removal action
     */
    public removeClans(clansToRemove: string[]): string[] {
        if (!clansToRemove.length) {
            return ['No clans supplied.'];
        }

        // Filter out any non-numeric only inputs, and determine if they are in the currently tracked list
        const validClans: number[] = clansToRemove.filter(clanId => /^[0-9]*$/.test(clanId))
            .map(clanId => parseInt(clanId, 10))
            .filter(clanId => this._clanListService.getClanList().has(clanId));

        if (!validClans.length) {
            return ['None of the requested clans are valid.'];
        }

        const action: string[] = ['Successfully removed:'];
        const response: Map<number, Clan> = this._clanListService.removeClans(validClans);
        const output = Array.from(response.values()).map(clan => clan.getClanInfo());
        return action.concat(output);
    }

    /**
     * Provides a user readable list of all clans currently being tracked.
     *
     * @returns
     *      An array of Discord message(s) containing the info of each tracked clan
     */
    public showClanList(): string[] {
        const clans: Clan[] = Array.from(this._clanListService.getClanList().values());

        return clans.map(clan => clan.getClanInfo());
    }
}
