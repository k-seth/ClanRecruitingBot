// A Discord bot for watching World of Tanks clans
// Copyright (C) 2019 Seth Kuipers

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// The modules imported by the server
import config from "./config.json";
import { createWriteStream, readFileSync } from "fs";
import Discord from "discord.js";

// Helper module imports
import { Helper } from "./modules/helper";
import { chunkedApiCall } from "./modules/api";
import { Core } from "./modules/core";

// Config constants
const APP = config.app;
const ACT_PRD = APP.inactive_weeks;
const BOT_CONFIG = config.bot;
const PREFIX = BOT_CONFIG.prefix;

// Path constants
const API = `https://api.worldoftanks${Helper.determineRegionValues(APP.server)}`;
const TRACKED_CLANS = "./clan_list.json";
const HISTORICAL = "./historical/oldClanRosters";

// Success constants
const OK_EPTY = { result: "No clans supplied. No action taken" };
const OK_NEW = { result:  "New data has been saved" };
const OK_NONE = { result: "No players have left any tracked clans" };
const OK_UPDT = { result: "Successfully completed operation. Member data will be updated on next check" };

// Other constants
const CHAR_LIMIT = 1850 // Discord has a 2000 character limit. 1850 is to be safe
let CLAN_LIST = [];
findClanlist().then(promise => CLAN_LIST = promise);
const BOT = new Discord.Client();

const core = new core();
// DISCORD FUNCTIONS

BOT.login(BOT_CONFIG.token);
BOT.on("message", async function(message) {
    if (!message.content.startsWith(PREFIX) || message.author.bot) {
        return;
    }

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === BOT_CONFIG.list) {
        const tracked = await showClanList();
        message.channel.send(tracked.result);
    } else if (command === BOT_CONFIG.help) {
        message.channel.send("Command coming soon!");
    } else if (command === BOT_CONFIG.add || command === BOT_CONFIG.remove) {
        if (!args.length) {
            return message.channel.send(OK_EPTY.result);
        }

        const res = command === BOT_CONFIG.add ? await addNewClans(args) : await removeExistingClans(args);
        message.channel.send(res.result);
        message.channel.send(`Invalid clans: ${res.invalid}`);
    } else if (command === BOT_CONFIG.seed || command === BOT_CONFIG.check) {
        const list = await updateData(command === BOT_CONFIG.check);
        if (list.result) {
            return message.channel.send(list.result);
        }

        // TODO: Split this into another function. It is the only section to have significant
        //  logic in the command branch, making it very messy looking
        let reply = "";
        for (const playerId in list) {
            let playerAndClan = `${list[playerId].nickname} left ${list[playerId].clan}`;
            playerAndClan = playerAndClan.replace(/_/g, "\\\_");
            reply += `${playerAndClan}\n${list[playerId].status}\n`;

            // Break it up into multiple messages to avoid breaking Discord
            if (reply.length > CHAR_LIMIT) {
                message.channel.send(reply);
                reply = "";
            }
        }
        message.channel.send(reply);
    }
});

// CORE FUNCTIONS

/**
 * An async function which makes an API call to get the names of all the and then constructs and returns the message
 * for the app
 *
 * @param leftPlayers
 *      A JSON containing the account id and former clan of of all players that have left in the given period
 * @returns {Promise<{}|T|{result: string}>}
 *      A JSON representing the names and clans of all players that left, or a generic message if none
 */
async function constructNameList(leftPlayers) {
    const WOTLABS = `https://wotlabs.net/${APP.server}/player/`;
    const EPOCH_WEEK = 604800;

    const playersList = Object.keys(leftPlayers);
    const nameList = await chunkedApiCall(playersList, `${API}/wot/account/info/`, "account_id",
                                    "nickname,last_battle_time", APP.application_id);
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
        if (ACT_PRD >= 1 && (new Date).getTime()/1000 - nameList[playerId].last_battle_time >= EPOCH_WEEK * ACT_PRD) {
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
function updateRosters(simplifiedNew, check) {
    let simplifiedOld = {};

    if (check) {
        simplifiedOld = JSON.parse(readFileSync(HISTORICAL, "utf-8"));
        checkChanges(simplifiedOld, CLAN_LIST);
    }

    createWriteStream(HISTORICAL).write(JSON.stringify(simplifiedNew), "utf-8");

    if (!check) {
        return OK_NEW;
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
async function updateData(check) {
    // API has a cap of 100 clans in a single call, so split up the array and make separate calls
    const clanList = await chunkedApiCall(CLAN_LIST, `${API}/wot/clans/info/`, "clan_id",
                                    "members.account_id,tag", APP.application_id);
    if (clanList.result) {
        return clanList;
    }

    const simplifiedOld = updateRosters(Helper.simplifyRoster(clanList), check);
    if (!Object.keys(simplifiedOld).length) {
        return OK_NONE;
    } else if (simplifiedOld.result) {
        return simplifiedOld;
    }

    return await constructNameList(simplifiedOld);
}

/**
 * A function which adds the given clans to the list of tracked clans
 *
 * @param clansToAdd
 *      An array representing the ids of clans to add to the list of tracked clans
 * @returns {Promise<{result: string, invalid: []}>}
 *      An object which includes the result JSON and an array of invalid clans
 */
async function addNewClans(clansToAdd) {
    const invalidClans = [];

    for (const id of clansToAdd) {
        const clanId = parseInt(id);
        // TODO: Validate id
        if (CLAN_LIST.indexOf(clanId) === -1) {
            CLAN_LIST.push(clanId);
            continue;
        }
        invalidClans.push(clanId)
    }

    createWriteStream(TRACKED_CLANS).write(JSON.stringify({ clanlist: CLAN_LIST }), "utf-8");

    return { result: OK_UPDT.result, invalid: invalidClans };
}

/**
 * A function which removes the given clans from the list of tracked clans
 *
 * @param clansToRemove
 *      An array representing the ids of the clans to remove from the list of tracked clans
 * @returns {Promise<{result: string, invalid: []}>}
 *      An array which includes the result JSON and an array of invalid clans
 */
async function removeExistingClans(clansToRemove) {
    const invalidClans = [];

    for (const id of clansToRemove) {
        const clanId = parseInt(id);
        const index = CLAN_LIST.indexOf(clanId);

        index === -1 ? invalidClans.push(clanId) : CLAN_LIST.splice(index, 1);
    }

    createWriteStream(TRACKED_CLANS).write(JSON.stringify({ clanlist: CLAN_LIST }), "utf-8");

    return { result: OK_UPDT.result, invalid: invalidClans };
}

/**
 * A function which provides a user readable list of all clans currently being tracked
 *
 * @returns {Promise<{}|T|{result: string}|{result: []}>}
 *      An array containing the id and tag of all tracked clans
 */
async function showClanList() {
    const returnedData = await chunkedApiCall(CLAN_LIST, `${API}/wot/clans/info/`, "clan_id",
                                        "tag", APP.application_id);
    if (returnedData.result) {
        return returnedData;
    }

    const clanListWithTag = [];
    for (const clanId in returnedData) {
        clanListWithTag.push(`${clanId} - ${returnedData[clanId].tag.replace(/_/g, "\\\_")}`);
    }

    return { result: clanListWithTag };
}
