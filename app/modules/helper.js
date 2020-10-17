import { existsSync } from "fs";
import * as path from "path";
import { Api } from "./api";

export const TRACKED_CLANS = path.join(__dirname, "..", "clan_list.json");

export class Helper {
    constructor(config) {
        this.config = config;
    }

    /**
     * Helper function for determining which list of clans to use. Uses modified list if it exists
     *
     * @returns {Promise<any|[]>}
     *      A promise containing the list of clans that will be initially loaded for tracking
     */
    async findClanlist() {
        if (existsSync(TRACKED_CLANS)) {
            return import(TRACKED_CLANS).then((list) => {
                return list.clanlist;
            })
        }
        return this.config.clanlist;
    }

    /**
     * Helper function for removing players in clans no longer being tracked by the application
     *
     * @param simplifiedOld
     *      The roster read back from the saved file
     * @param clanList
     *      The list of clans tracked by the server
     */
    static checkChanges(simplifiedOld, clanList) {
        for (const playerId in simplifiedOld) {
            if (!clanList.includes(parseInt(simplifiedOld[playerId].clan_id))) {
                delete simplifiedOld[playerId];
            }
        }
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

    /**
     * A helper function that checks for and removes any clans that do not contain only numbers.
     * Does not check if the clan is valid, just that it will not break the API
     *
     * Split from validateClanList to enable isolated regex testing
     *
     * @param clanList
     *      The array of clans to sanitize
     * @returns {{valid: *, invalid: []}}
     *      A list of invalid clans found
     */
    static sanitizeClanId(clanList) {
        let clansToCheck = clanList;
        const invalidClans = [];

        for (const id of clansToCheck) {
            if (!/^[0-9]*$/.test(id)) {
                invalidClans.push(id);
            }
        }

        clanList = Helper.removeInvalids(clansToCheck, invalidClans);

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
     * @returns {Promise<{valid: *, invalid: *[]}>}
     *      A list of invalid clans found
     */
    static async validateClanList(clanList, api, appId) {
        const sanitizeResult = Helper.sanitizeClanId(clanList);

        const clansToCheck = sanitizeResult.valid;
        let invalidClans = [];

        if (!clansToCheck.length) {
            return { valid: clanList, invalid: invalidClans.concat(sanitizeResult.invalid) };
        }

        const clanData = await Api.chunkedApiCall(clansToCheck, `${api}/wot/clans/info/`, "clan_id",
            "clan_id", appId);

        for (const id in clanData) {
            if (clanData[id] === null) {
                invalidClans.push(id);
            }
        }

        clanList = Helper.removeInvalids(clansToCheck, invalidClans);

        return { valid: clanList, invalid: invalidClans.concat(sanitizeResult.invalid) };
    }

    /**
     * Helper function to simply remove any invalid clans from the list of clans
     *
     * @param clanList
     *      The list of clans that needs to be cleaned of invalid entries
     * @param invalidClans
     *      The list of invalid entries to be removed
     */
    static removeInvalids(clanList, invalidClans) {
        for (const id of invalidClans) {
            clanList.splice(clanList.indexOf(id), 1);
        }

        return clanList;
    }

    /**
     * Helper function to get the recent wn8 for the player
     * TODO: Add testing
     *
     * @param url
     *      The Wotlabs url for the player
     * @returns {Promise<string>}
     *      A string representing the wn8 of the player
     */
    async static getPlayerRwn8(url) {
        const searchString = "Recent WN8";
        // Length of searchString + span tag + newline
        const increment = 10 + 7 + 1;

        const page = await Api.callWotlabs(url);
        if (page.result) {
            return "Unavailable";
        }

        const index = page.indexOf(searchString);
        return page.substr(index + increment, 4);
    }
}
