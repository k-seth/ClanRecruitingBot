import { ApiService } from '../service/apiService';
import { Clan } from '../object/clan';
import { ClanListService } from '../service/clanListService';
import { ConfigService } from '../service/configService';
import { Player } from '../object/player';
import { RosterUpdate } from '../util/interfaces';

/**
 * Manages the Discord requests related to player information
 */
export class PlayerManager {
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
                private readonly _clanListService: ClanListService,
    ) {
    }

    /**
     * A handler function which makes calls to functions to update rosters and construct the list of players that have left.
     *
     * @returns
     *      An array containing one or more strings representing the result of the request
     */
    public async updatePlayerData(): Promise<string[]> {
        let clanData: Map<number, Clan>;
        try {
            clanData = await this._apiService.fetchClanData(this._clanListService.getApiList());
        } catch (error) {
            return [error.message] as string[];
        }


        const playerData: Map<number, Map<number, Player>> = new Map<number, Map<number, Player>>();
        const result: string[] = [];

        for (const [clanId, clan] of clanData.entries()) {
            playerData.set(clanId, c) = this._clanListService.updateClanRoster(clanId, clan.getRoster());

            result.concat(clanResult);
        }



        if (!result.length) {
            return ['No players have left since the last check.'];
        }

        return result;
    }

    /**
     * Sets new rosters
     *
     * @returns
     *      A string confirming that new data has been saved
     */
    public async loadFreshRosters(): Promise<string[]> {
        let clanData: Map<number, Clan>;
        try {
            clanData = await this._apiService.fetchClanData(this._clanListService.getApiList());
        } catch (error) {
            return [error.message] as string[];
        }

        const playerData: Map<number, RosterUpdate> = new Map<number, RosterUpdate>();
        const clanList = this._clanListService.getClanList();

        // Since this is a complete refresh, remove the entire old roster and add the new one
        for (const [id, clan] of clanData) {
            const update: RosterUpdate = { remove: clanList.get(id).getRoster(), add: clan.getRoster() };
            playerData.set(id, update);
        }

        // Drop the return value, since the Discord message does not use it
        void this._clanListService.updateClanRoster(playerData);

        return ['New player data has been saved.'];
    }
}
