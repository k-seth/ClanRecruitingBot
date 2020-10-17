import { createWriteStream, readFileSync } from "fs";
import { Helper, TRACKED_CLANS } from "./helper";
import { Api } from "./api";

export class Core {
    static OK_NEW = { result: "New data has been saved" };
    static OK_NONE = { result: "No players have left any tracked clans" };
    static OK_UPDT = { result: "Successfully completed operation. Member data will be updated on next check" };
    static HISTORICAL = "./historical/oldClanRosters";

    constructor(config) {
        this.config = config;
        this.helper = new Helper(config);

        this.clanList = [];
        this.helper.findClanlist().then(promise => this.clanList = promise);
        this.api = `https://api.worldoftanks${Helper.determineRegionValues(this.config.app.server)}`;
    }

    /**
     * An async function which makes an API call to get the names of all the and then constructs and returns the message
     * for the app
     *
     * @param leftPlayers
     *      A JSON containing the account id and former clan of of all players that have left in the given period
     * @returns {Promise<{}|T|{result: string}>}
     *      A JSON representing the names and clans of all players that left, or a generic message if none
     */
    async constructNameList(leftPlayers) {
        const WOTLABS = `https://wotlabs.net/${this.config.app.server}/player/`;
        const ACTIVE_PERIOD = this.config.app.inactive_weeks;
        const EPOCH_WEEK = 604800;

        const playersList = Object.keys(leftPlayers);
        const nameList = await Api.chunkedApiCall(playersList, `${this.api}/wot/account/info/`, "account_id",
            "nickname,last_battle_time", this.config.app.application_id);
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
            if (ACTIVE_PERIOD >= 1 && (new Date).getTime()/1000 - nameList[playerId].last_battle_time >= EPOCH_WEEK * ACTIVE_PERIOD) {
                nameList[playerId].status = "Inactive";
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
     * @returns {{result: string}|{}}
     *      A JSON containing all players that have left, or a generic message
     */
    updateRosters(simplifiedNew, check) {
        let simplifiedOld = {};

        if (check) {
            simplifiedOld = JSON.parse(readFileSync(Core.HISTORICAL, "utf-8"));
            Helper.checkChanges(simplifiedOld, this.clanList);
        }

        createWriteStream(Core.HISTORICAL).write(JSON.stringify(simplifiedNew), "utf-8");

        if (!check) {
            return Core.OK_NEW;
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
     * @returns {Promise<{}|T|{result: string}|{result: string}>}
     *      An object containing the names of all players who have left their clan
     */
    async updateData(check) {
        // API has a cap of 100 clans in a single call, so split up the array and make separate calls
        const clanData = await Api.chunkedApiCall(this.clanList, `${this.api}/wot/clans/info/`, "clan_id",
            "members.account_id,tag", this.config.app.application_id);
        if (clanData.result) {
            return clanData;
        }

        const simplifiedOld = this.updateRosters(Helper.simplifyRoster(clanData), check);
        if (!Object.keys(simplifiedOld).length) {
            return Core.OK_NONE;
        } else if (simplifiedOld.result) {
            return simplifiedOld;
        }

        return await this.constructNameList(simplifiedOld);
    }

    /**
     * A function which adds the given clans to the list of tracked clans
     *
     * @param clansToAdd
     *      An array representing the ids of clans to add to the list of tracked clans
     * @returns {Promise<{result: string, invalid: []}>}
     *      An object which includes the result JSON and an array of invalid clans
     */
    async addNewClans(clansToAdd) {
        const sanitizeResult = await Helper.validateClanList(clansToAdd, this.api, this.config.app.application_id);

        clansToAdd = sanitizeResult.valid;
        const invalidClans = sanitizeResult.invalid;

        if (!clansToAdd.length) {
            return { result: "No valid clans. Nothing added", invalid: invalidClans };
        }

        for (const id of clansToAdd) {
            const clanId = parseInt(id);
            if (this.clanList.indexOf(clanId) === -1) {
                this.clanList.push(clanId);
                continue;
            }
            invalidClans.push(clanId)
        }

        createWriteStream(TRACKED_CLANS).write(JSON.stringify({ clanlist: this.clanList }), "utf-8");

        return { result: Core.OK_UPDT.result, invalid: invalidClans };
    }

    /**
     * A function which removes the given clans from the list of tracked clans
     *
     * @param clansToRemove
     *      An array representing the ids of the clans to remove from the list of tracked clans
     * @returns {Promise<{result: string, invalid: []}>}
     *      An array which includes the result JSON and an array of invalid clans
     */
    async removeExistingClans(clansToRemove) {
        const invalidClans = [];

        for (const id of clansToRemove) {
            const clanId = parseInt(id);
            const index = this.clanList.indexOf(clanId);

            index === -1 ? invalidClans.push(clanId) : this.clanList.splice(index, 1);
        }

        createWriteStream(TRACKED_CLANS).write(JSON.stringify({ clanlist: this.clanList }), "utf-8");

        return { result: Core.OK_UPDT.result, invalid: invalidClans };
    }

    /**
     * A function which provides a user readable list of all clans currently being tracked
     *
     * @returns {Promise<{}|T|{result: string}|{result: []}>}
     *      An array containing the id and tag of all tracked clans
     */
    async showClanList() {
        const returnedData = await Api.chunkedApiCall(this.clanList, `${this.api}/wot/clans/info/`, "clan_id",
            "tag", this.config.app.application_id);
        if (returnedData.result) {
            return returnedData;
        }

        const clanListWithTag = [];
        for (const clanId in returnedData) {
            clanListWithTag.push(`${clanId} - ${returnedData[clanId].tag.replace(/_/g, "\\\_")}`);
        }

        return { result: clanListWithTag };
    }
}
