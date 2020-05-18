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
import { readFileSync, createWriteStream, existsSync } from "fs";
import fetch from "node-fetch";
import Discord from "discord.js";

// Config constants
const APP = config.app;
const ACT_PRD = APP.inactive_weeks;
const BOT_CONFIG = config.bot;

// Path constants
const API = "https://api.worldoftanks" + determineRegionValues(APP.server);
const TRACKED_CLANS = "./clan_list.json";
const HISTORICAL = "./historical/oldClanRosters";
const WOTLABS = "https://wotlabs.net/" + APP.server + "/player/";

// Startup critical error constants
const CRT_API = { critical : "An API key must be given (Non-null, not default value)" };
const CRT_BOT = { critical : "A Discord bot token must be given (Non-null, not default value)" };
const CRT_RGN = { critical : "An invalid region has been selected (Must be one of: 'na', 'eu', 'ru' or 'sea')" };
const CRT_FORM = { critical : "The configuration file is incorrectly formatted or missing parameters" };

// Startup warning constants
const WRN_ACTV = { warning : "An invalid value has been provided for the inactivity period. This feature will be disabled" };
const WRN_CLAN = { warning : "The list of clans is empty -- No data will be checked" };
const WRN_CMD = { warning: "One or more Discord commands are empty. Proper functionality will likely be impaired" };
const WRN_RGN = { warning : "Server has changed from default. Ensure clan list has been updated" };

// Runtime error constants
const ERR_API = { result : "An unexpected error occurred contacting the Wargaming API" };
const ERR_RTN = { result : "An unexpected error occurred with the data returned by Wargaming" };

// Success constants
const OK_EPTY = { result : "No clans supplied. No action taken" };
const OK_NEW = { result : "New data has been saved" };
const OK_NONE = { result : "No players have left any tracked clans" };
const OK_UPDT = { result : "Successfully completed operation. Member data will be updated on next check" };

// Other constants
const CHAR_LIMIT = 1850 // Discord has a 2000 character limit. 1850 is to be safe
let CLAN_LIST = []; // Technically not a constant, but it needs to be like this to be able to assign its list
findClanlist().then(promise => {
    CLAN_LIST = promise;
});
const BOT = new Discord.Client();
const EPOCH_WEEK = 604800;
const MAX_API_SIZE = 100;

// DISCORD FUNCTIONS

BOT.login(BOT_CONFIG.token);
BOT.on("message", async function(message) {
    if (message.content === BOT_CONFIG.list) {
        const tracked = await showClanList();
        message.channel.send(tracked);
        return;
    } else if (message.content === BOT_CONFIG.help) {
        message.channel.send("Command coming soon!");
        return;
    }

    const split = message.content.split(/ +/);

    if (split[0] === BOT_CONFIG.add || split[0] === BOT_CONFIG.remove) {
        if (split.length === 1) {
            message.channel.send(OK_EPTY.result);
        } else {
            const res = split[0] === BOT_CONFIG.add ? await addNewClans(split) : await removeExistingClans(split);
            message.channel.send(res[0].result);
            message.channel.send("Invalid clans: " + res[1]);
        }
        return;
    }

    if (message.content !== BOT_CONFIG.check && message.content !== BOT_CONFIG.seed) {
        return;
    }

    const runCheck = (message.content !== BOT_CONFIG.seed);
    let list = await getNewRosters(runCheck);

    if (list.result) {
        message.channel.send(list.result);
    } else {
        let reply = "";
        for (let playerId in list) {
            let playerAndClan = list[playerId].nickname + " left " + list[playerId].clan;
            playerAndClan = playerAndClan.replace(/_/g, "\\\_");
            reply += playerAndClan + "\n<" + list[playerId].status + ">\n";
            // Break it up into multiple messages to avoid breaking Discord
            if(reply.length > CHAR_LIMIT) {
                message.channel.send(reply);
                reply = "";
            }
        }
        message.channel.send(reply);
    }
});

// CORE FUNCTIONS

// A function which adds the given clans to the list of tracked clans
// In:  messageArray - An array representing the message sent in Discord
// Out: Returns an array which includes the result JSON and an array of invalid clans
async function addNewClans(messageArray) {
    const invalidClans = [];

    messageArray.shift(); // Remove command from list

    for (const id of messageArray) {
        const clanId = parseInt(id);
        // TODO: Validate id
        if (CLAN_LIST.indexOf(clanId) === -1) {
            CLAN_LIST.push(clanId);
        } else {
            invalidClans.push(clanId)
        }
    }

    createWriteStream(TRACKED_CLANS).write(JSON.stringify({ "clanlist": CLAN_LIST }), "utf-8");

    return [OK_UPDT, invalidClans];
}

// An async function which makes an API call to get the names of all the and then constructs and returns the message for the app
// In:  leftPlayers - A JSON containing the account id and former clan of of all players that have left in the given period
// Out: Returns a JSON representing the names and clans of all players that left, or a generic message if none
async function constructNameList(leftPlayers) {
    const playersList = Object.keys(leftPlayers);
    const nameList = {};

    for (let i = 0; i < playersList.length; i += MAX_API_SIZE) {
        const playersToConvert = playersList.slice(i, i + MAX_API_SIZE).join();

        const bodyObj = { "application_id": APP.application_id, "account_id": playersToConvert, "fields": "nickname,last_battle_time" };
        const body = new URLSearchParams(bodyObj);
        const json = await callApi(API + "/wot/account/info/", body);
        if (json.error) {
            return json;
        }

        Object.assign(nameList, json.data);
    }

    // For all players remaining in the list, get and add their former clan tag and wotlabs url to the data returned from API call
    for (let playerId in nameList) {
        if (nameList[playerId] === null) {
            delete nameList[playerId];
            continue;
        }

        nameList[playerId].clan = leftPlayers[playerId].clan_tag;
        if (ACT_PRD >= 1 && (new Date).getTime()/1000 - nameList[playerId].last_battle_time >= EPOCH_WEEK * ACT_PRD) {
            nameList[playerId].status = "(Inactive)";
        } else {
            nameList[playerId].status = WOTLABS + nameList[playerId].nickname;
        }
    }

    return nameList;
}

// An async function which will call the API and get up-to-date clan rosters
// In:  check - A boolean representing whether or not a full roster check should be completed
// Out: Returns a JSON representing the completion state of the program, either a generic success message or a list of players that have left their clan
async function getNewRosters(check) {
    const clanData = {};

    // API has a cap of 100 clans in a single call, so split up array and may separate calls
    for (let i = 0; i < CLAN_LIST.length; i += MAX_API_SIZE) {
        const clansToCheck = CLAN_LIST.slice(i, i + MAX_API_SIZE).join();

        const bodyObj = { "application_id": APP.application_id, "clan_id": clansToCheck, "fields": "members.account_id,tag" };
        const body = new URLSearchParams(bodyObj);
        const json = await callApi(API + "/wot/clans/info/", body);
        if (json.error) {
            return json;
        }

        Object.assign(clanData, json.data);
    }

    return await updateRosters(simplifyRoster(clanData), check);
}

// A function which removes the given clans from the list of tracked clans
// In:  messageArray - An array representing the message sent in Discord
// Out: Returns an array which includes the result JSON and an array of invalid clans
async function removeExistingClans(messageArray) {
    const invalidClans = [];

    messageArray.shift(); // Remove command from list

    for (const id of messageArray) {
        const clanId = parseInt(id);
        const index = CLAN_LIST.indexOf(clanId);

        index === -1 ? invalidClans.push(clanId) : CLAN_LIST.splice(index, 1);
    }

    createWriteStream(TRACKED_CLANS).write(JSON.stringify({ "clanlist": CLAN_LIST }), "utf-8");

    return [OK_UPDT, invalidClans];
}

// A function which provides a user readable list of all clans currently being tracked
// In:  None
// Out: Returns an array of all tracked clans
async function showClanList() {
    // TODO: Formalize this, have clan names shown as well
    return CLAN_LIST;
}

// A function which reads historical data and writes the new rosters to file. Returns the list of players that left their respective clans
// In:  newRoster - The data from an API call in the form of an object holding the new player data
//      check - A boolean representing whether a full check should be completed
// Out: Returns a JSON containing all players that have left, or a generic message
async function updateRosters(simplifiedNew, check) {
    let simplifiedOld = {};

    if (check) {
        simplifiedOld = JSON.parse(readFileSync(HISTORICAL, "utf-8"));
        checkChanges(simplifiedOld);
    }

    createWriteStream(HISTORICAL).write(JSON.stringify(simplifiedNew), "utf-8");

    if (!check) {
        return OK_NEW;
    }

    // Compare simplifiedOld to simplifiedNew, and remove any occurrences that exist in both with the same clan tag
    // This should leave only those players in simplifiedOld that are still in a/the same clan
    for (let playerId in simplifiedOld) {
        if (playerId in simplifiedNew && simplifiedOld[playerId].clan_id === simplifiedNew[playerId].clan_id) {
            delete simplifiedOld[playerId];
        }
    }

    return (Object.keys(simplifiedOld).length === 0 ? OK_NONE : await constructNameList(simplifiedOld));
}

// API CALL FUNCTIONS

// A simple API call using fetch. Uses POST to ensure data does not exceed URL length
// In:  url  - The url to which to fetch the data from
//      body - The body data to be sent. JSON encoded as URLSearchParams
// Out: Returns a JSON which is expected to be returned by the Wargaming API
async function callApi(url, body) {
    return await fetch(url, {
        method: "post",
        body: body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
        .then(async res => {
            const response = await res.json();
            return response.status === "error" ? ERR_RTN : response;
        })
        .catch(() => {
            return ERR_API;
        });
}

// HELPER FUNCTIONS

// Helper function for removing players in clans no longer being tracked by the application
// In:  simplifiedOld - The roster read back from the saved file
// Out: Returns a minimized version of the simplifiedOld roster
function checkChanges(simplifiedOld) {
    for (let playerId in simplifiedOld) {
        if (!CLAN_LIST.includes(parseInt(simplifiedOld[playerId].clan_id))) { // Convert from string to int to be able to make comparison
            delete simplifiedOld[playerId];
        }
    }
}

// Helper function for assigning the correct values for the various regions. Used for completing API url
// In:  region - The server specified in the config that the data will work off of
// Out: Returns the necessary top level domain information
function determineRegionValues(region) {
    switch (region.toLowerCase()) {
        case "na":
            return ".com";
        case "eu":
            return ".eu";
        case "ru":
            return ".ru";
        case "sea":
            return ".asia";
    }
}

// Helper function for determining which list of clans to use. Uses modified list if it exists
// In:  None
// Out: Returns a promise containing the list of clans that will be initially loaded for tracking
async function findClanlist() {
    // TODO: Validate this list
    if (existsSync(TRACKED_CLANS)) {
        return import(TRACKED_CLANS).then((list) => {
            return list.clanlist;
        })
    } else {
        return config.clanlist;
    }
}

// Helper function for converting the roster from Wargaming's API to a more efficient format
// In:  newRoster - The JSON returned by the Wargaming API with up-to-date clan data
// Out: Returns a simplified version of the newRoster
function simplifyRoster(newRoster) {
    let simplifiedNew = {};

    for (let clanId in newRoster) {
        let tag = newRoster[clanId].tag;
        for (let playerIndex in newRoster[clanId].members) {
            simplifiedNew[newRoster[clanId].members[playerIndex].account_id] = { clan_id : clanId, clan_tag : tag };
        }

        delete newRoster[clanId]
    }
    return simplifiedNew;
}

// Helper function to ensure that critical configuration data is available before startup.
// Checks for:
//      Fields: Not all present or unreadable   - Critical error
//      API Key: Empty or default               - Critical error
//      Discord Token: Empty or default         - Critical error
//      Server: Invalid server                  - Critical error
//              Modified                        - Warning
//      Inactive: Invalid value                 - Warning
//      Seed: Empty                             - Warning
//      Command: Empty                          - Warning
//      Clan List: Empty                        - Warning
// In:  None
// Out: A boolean representing whether or not a startup can proceed
function validateConfiguration() {
    console.error(ERR_RGN);

}