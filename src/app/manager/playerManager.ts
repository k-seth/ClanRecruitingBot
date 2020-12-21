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
     * @return
     *      An array containing one or more strings representing the result of the request
     */
    public async updatePlayerData(): Promise<string[]> {
        let clanData: Map<number, Clan>;
        try {
            clanData = await this._apiService.fetchClanData(this._clanListService.getApiList());
        } catch (error) {
            return [error.message] as string[];
        }

        const playerData: Map<number, RosterUpdate> = new Map<number, RosterUpdate>();
        const clanList = this._clanListService.getClanList();

        // Iterate over the old and new rosters for each clan to find the differences
        for (const [clanId, clan] of clanData.entries()) {
            // TODO: This could use some cleaning up yet
            const newRoster: Map<number, Player> = clan.getRoster();
            const oldRoster: Map<number, Player> = clanList.get(clanId).getRoster();

            const newPlayerIds: number[] = Array.from(newRoster.keys()).filter(id => !oldRoster.has(id));
            const leftPlayerIds: number[] = Array.from(oldRoster.keys()).filter(id => !newRoster.has(id));

            const newPlayers: Map<number, Player> = new Map<number, Player>();
            const leftPlayers: Map<number, Player> = new Map<number, Player>();

            newPlayerIds.forEach(id => newPlayers.set(id, newRoster.get(id)));
            leftPlayerIds.forEach(id => leftPlayers.set(id, oldRoster.get(id)));

            if (newPlayers.size || leftPlayers.size) {
                playerData.set(clanId, { remove: leftPlayers, add: newPlayers });
            }
        }

        const result = this._clanListService.updateClanRoster(playerData);
        if (!result.size) {
            return ['No players have left since the last check.'];
        }

        // Convert the result into a output friendly format
        const output: string[] = [];
        for (const [clanId, leftPlayers] of result) {
            output.push(`**${ clanList.get(clanId).getTag() }**`);

            for (const player of leftPlayers.values()) {
                output.push(`${ player.getPlayerInfo() }`);
            }

            output.push(` `);
        }

        return output;
    }

    /**
     * A handler function for setting completely new rosters for clans
     *
     * @return
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
