// A Discord bot to help clans in World of Tanks with recruiting
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

BOT.login(BOT_CONFIG.token);\
BOT.on("message", async function(message) {\
    let runCheck = true;\
    // Listen for messages that says the command specified in config.json. No else is used so that the channel can still be used for communication\
    if (message.content !== BOT_CONFIG.command \&\& message.content !== BOT_CONFIG.seed) {\
        return;\
    } else if (message.content === BOT_CONFIG.seed) {\
        runCheck = false;\
    }\
    let list = await getNewRosters(runCheck);\
    if (list.success) {\
        message.channel.send(list.success);\
    } else {\
        let reply = "";\
        for (let playerId in list) {\
            let playerAndClan = list[playerId].nickname + " left " + list[playerId].clan;\
            playerAndClan = playerAndClan.replace(/_/g, "\\\\\\_");\
            // Add inactive check\
            reply += playerAndClan + "\\n<" + list[playerId].url + ">\\n";\
            // In the event that there is a large number of players, break it up into multiple messages to avoid breaking Discord\
            if(reply.length > CHAR_LIMIT) {\
                message.channel.send(reply);\
                reply = "";\
            }\
        }\
        message.channel.send(reply);\
    }\
});
