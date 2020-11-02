import { Player } from '../object/player';
import { ClanListService } from '../service/clanListService';
import { PlayerListService } from '../service/playerListService';
import { Api } from '../util/api';
import { Util } from '../util/util';

/**
 * Manages the Discord requests related to player information
 */
export class PlayerManager {
    /**
     * @param _api
     *      The api endpoint to use
     * @param _config
     *      The app section of the program configuration file
     * @param _clanListService
     *      The service that handles the list of tracked clans
     * @param _playerListService
     *      The service that handles the list of players
     */
    constructor(private readonly _api: string,
                private readonly _config,
                private readonly _clanListService: ClanListService,
                private readonly _playerListService: PlayerListService
    ) {
    }

    /**
     * Helper function for removing players in clans no longer being tracked by the application
     *
     * @param oldRoster
     *      The old player data
     */
    private checkChanges(oldRoster: Player[]): void {
        for (const player of oldRoster) {
            const index = oldRoster.indexOf(player);
            if (this._clanListService.getClanList().findIndex(clan => clan.id === player.getClanId()) === -1) {
                oldRoster.splice(index, 1);
            }
        }
    }

    /**
     * Helper function for converting the roster from Wargaming's API to a more efficient format
     *
     * @param newRoster
     *      The JSON returned by the Wargaming API with up-to-date clan data
     * @returns
     *      A simplified version of the newRoster
     */
    private static simplifyRoster(newRoster: {}): {} {
        const simplifiedNew = {};

        for (const clanId in newRoster) {
            const tag = newRoster[clanId].tag;
            for (const playerIndex in newRoster[clanId].members) {
                simplifiedNew[newRoster[clanId].members[playerIndex].account_id] = { clan_id: clanId, clan_tag: tag };
            }

            delete newRoster[clanId];
        }
        return simplifiedNew;
    }

    /**
     * An async function which makes an API call to get the names of all the and then constructs and returns the message
     * for the app
     *
     * @param leftPlayers
     *      A JSON containing the account id and former clan of of all players that have left in the given period
     * @returns
     *      A JSON representing the names and clans of all players that left, or a generic message if none
     */
    public async constructNameList(leftPlayers: {}): Promise<{}|any|{result: string}> {
        const _wotLabs = `https://wotlabs.net/${this._config.server}/player/`;
        const _activePeriod = this._config.inactive_weeks;
        const _epochWeek = 604800;

        const playersList = Object.keys(leftPlayers);
        const nameList = await Api.chunkedApiCall(playersList, `${this._api}/wot/account/info/`, 'account_id',
            'nickname,last_battle_time', this._config.application_id);
        if (nameList.result) {
            return nameList;
        }

        // Get and add player's former clan tag and wotlabs url to the data returned from API call
        for (const playerId in nameList) {
            if (nameList[playerId] === null) {
                delete nameList[playerId];
                continue;
            }

            nameList[playerId].clan = leftPlayers[playerId].clan_tag;
            if (_activePeriod >= 1 && (new Date()).getTime()/1000 - nameList[playerId].last_battle_time >= _epochWeek * _activePeriod) {
                nameList[playerId].status = 'Inactive';
                continue;
            }
            nameList[playerId].status = `<${_wotLabs}${nameList[playerId].nickname}>`;
        }

        return nameList;
    }

    /**
     * Compares the old roster data to the new roster to find all all players that are no longer in a clan
     *
     * @param oldRoster
     *      The old player roster
     * @param newRoster
     *      The new player roster
     * @returns
     *      An array containing the all players that have left
     */
    private findLeftPlayers(oldRoster: Player[], newRoster: Player[]): Player[] {
        const leftPlayers: Player[] = [];

        // Compare the old roster to the new roster, and remove any players in both
        // Clan does not matter, as someone who has left and joined a new clan can not be recruited anyway
        for (const oldPlayer of oldRoster) {
            if (newRoster.findIndex(newPlayer => newPlayer.id === oldPlayer.id) === -1) {
                leftPlayers.push(oldPlayer);
            }
        }

        return leftPlayers;
    }

    private buildNewRoster(apiData: any): Player[] {

        return;
    }

    /**
     * A handler function which makes calls to functions to update rosters and construct the list of players that have left.
     * Output is expected to be Discord safe.
     *
     * @param check
     *      A boolean representing whether or not a full roster check should be completed
     * @returns
     *      An array containing one or more strings representing the result of the request
     */
    public async updateData(check: boolean): Promise<string[]> {
        const oldRoster = this._playerListService.retrieveRoster();
        this.checkChanges(oldRoster);

        const clanData = await Api.chunkedApiCall(this._clanListService.getApiList(), `${this._api}/wot/clans/info/`, 'clan_id',
            'members.account_id,tag', this._config.application_id);
        if (clanData.result) {
            return Util.discordify([clanData.result]);
        }

        const newRoster = this.buildNewRoster(clanData);
        this._playerListService.saveRoster(newRoster);

        // If all we are doing is seeding new data, just write the roster and return
        if (!check) {
            return Util.discordify(['New data has been saved.']);
        }

        const leftPlayers = this.findLeftPlayers(oldRoster, newRoster);
        if (!leftPlayers.length) {
            return Util.discordify(['No players have left any tracked clans.']);
        }
        // TODO: Get data for players that left and return that

        return Util.discordify(['']);
    }
}
