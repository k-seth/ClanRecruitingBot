import { existsSync } from "fs";

export class Helper {
    static TRACKED_CLANS = "../clan_list.json";

    constructor() {
    }

    /**
     * Helper function for removing players in clans no longer being tracked by the application
     *
     * @param simplifiedOld
     *      The roster read back from the saved file
     * @param clanList
     *      The list of clans tracked by the server
     */
    checkChanges(simplifiedOld, clanList) {
        for (const playerId in simplifiedOld) {
            if (!clanList.includes(parseInt(simplifiedOld[playerId].clan_id))) {
                delete simplifiedOld[playerId];
            }
        }
    }

    /**
     * Helper function for determining which list of clans to use. Uses modified list if it exists
     *
     * @returns {Promise<any|[]>}
     *      A promise containing the list of clans that will be initially loaded for tracking
     */
    async findClanlist() {
        // TODO: Validate this list
        if (existsSync(Helper.TRACKED_CLANS)) {
            return import(Helper.TRACKED_CLANS).then((list) => {
                return list.clanlist;
            })
        }
        return config.clanlist;
    }

    /**
     * Helper function for assigning the correct values for the various regions. Used for completing API URL
     *
     * @param region
     *      The server specified in the config that the data will work off of
     * @returns {string}
     *      The necessary top level domain information
     */
    static determineRegionValues(region) {
        switch (region.toLowerCase()) {
            case "na":
                return ".com";
            case "eu":
                return ".eu";
            case "ru":
                return ".ru";
            case "sea":
                return ".asia";
            default:
                throw new Error("Invalid region selected");
        }
    }

    /**
     * Helper function for converting the roster from Wargaming's API to a more efficient format
     *
     * @param newRoster
     *      The JSON returned by the Wargaming API with up-to-date clan data
     * @returns {{}}
     *      A simplified version of the newRoster
     */
    static simplifyRoster(newRoster) {
        const simplifiedNew = {};

        for (const clanId in newRoster) {
            let tag = newRoster[clanId].tag;
            for (let playerIndex in newRoster[clanId].members) {
                simplifiedNew[newRoster[clanId].members[playerIndex].account_id] = { clan_id: clanId, clan_tag: tag };
            }

            delete newRoster[clanId]
        }
        return simplifiedNew;
    }
}
