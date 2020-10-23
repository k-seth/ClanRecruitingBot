import { createWriteStream, readFileSync } from 'fs';
import { ClanListService } from '../service/clanListService';
import { Api } from '../util/api';

/**
 * Service class for updating
 */
export class DataManager {
    private readonly HISTORICAL = './historical/oldClanRosters';
    private readonly config: {};

    constructor(config: {},
                private readonly _clanListService: ClanListService
    ) {
        this.config = config;
    }

    /**
     * Helper function for removing players in clans no longer being tracked by the application
     *
     * @param simplifiedOld
     *      The roster read back from the saved file
     * @param clanList
     *      The list of clans tracked by the server
     */
    private static checkChanges(simplifiedOld: {}, clanList: any[]): void {
        for (const playerId in simplifiedOld) {
            if (!clanList.includes(parseInt(simplifiedOld[playerId].clan_id))) {
                delete simplifiedOld[playerId];
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
    public async constructNameList(leftPlayers: {}): Promise<{}|T|{result: string}> {
        const WOTLABS = `https://wotlabs.net/${this.config.app.server}/player/`;
        const ACTIVE_PERIOD = this.config.app.inactive_weeks;
        const EPOCH_WEEK = 604800;

        const playersList = Object.keys(leftPlayers);
        const nameList = await Api.chunkedApiCall(playersList, `${this.api}/wot/account/info/`, 'account_id',
            'nickname,last_battle_time', this.config.app.application_id);
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
            if (ACTIVE_PERIOD >= 1 && (new Date()).getTime()/1000 - nameList[playerId].last_battle_time >= EPOCH_WEEK * ACTIVE_PERIOD) {
                nameList[playerId].status = 'Inactive';
                continue;
            }
            nameList[playerId].status = `<${WOTLABS}${nameList[playerId].nickname}>`;
        }

        return nameList;
    }

    /**
     * A function which reads historical data and writes the new rosters to file. Returns the list of players that left
     * their respective clans
     *
     * @param simplifiedNew
     *      The data from an API call in the form of an object holding the new player data
     * @param check
     *      A boolean representing whether a full check should be completed
     * @returns
     *      A JSON containing all players that have left, or a generic message
     */
    public updateRosters(simplifiedNew: {}, check: boolean): {result: string}|{} {
        let simplifiedOld = {};

        if (check) {
            simplifiedOld = JSON.parse(readFileSync(this.HISTORICAL, 'utf-8'));
            DataManager.checkChanges(simplifiedOld, this.clanList);
        }

        createWriteStream(this.HISTORICAL).write(JSON.stringify(simplifiedNew), 'utf-8');

        if (!check) {
            return { result:  'New data has been saved' };
        }

        // Compare simplifiedOld to simplifiedNew, and remove any overlap that exists
        // Same clan does not matter, as someone who has left and joined a new clan can not be recruited anyway
        for (const playerId in simplifiedOld) {
            if (playerId in simplifiedNew) {
                delete simplifiedOld[playerId];
            }
        }

        return simplifiedOld;
    }

    /**
     * A handler function which makes calls to functions to update rosters and construct the list of players that have left
     *
     * @param check
     *      A boolean representing whether or not a full roster check should be completed
     * @returns
     *      An object containing the names of all players who have left their clan
     */
    public async updateData(check: boolean): Promise<{}|T|{result: string}> {
        // API has a cap of 100 clans in a single call, so split up the array and make separate calls
        const clanData = await Api.chunkedApiCall(this.clanList, `${this.api}/wot/clans/info/`, 'clan_id',
            'members.account_id,tag', this.config.app.application_id);
        if (clanData.result) {
            return clanData;
        }

        const simplifiedOld = this.updateRosters(DataManager.simplifyRoster(clanData), check);
        if (!Object.keys(simplifiedOld).length) {
            return { result: 'No players have left any tracked clans' };
        } else if (simplifiedOld.result) {
            return simplifiedOld;
        }

        return await this.constructNameList(simplifiedOld);
    }
}
