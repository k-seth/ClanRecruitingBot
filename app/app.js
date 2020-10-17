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
import Discord from "discord.js";

// Helper module imports
import { Core } from "./modules/core";

// Config constants
const BOT_CONFIG = config.bot;
const PREFIX = BOT_CONFIG.prefix;

// Success constants
const OK_EPTY = { result: "No clans supplied. No action taken" };

// Other constants
const CHAR_LIMIT = 1850 // Discord has a 2000 character limit. 1850 is to be safe
const BOT = new Discord.Client();
const core = new Core(config);

// DISCORD FUNCTIONS

BOT.login(BOT_CONFIG.token);
BOT.on("message", async function(message) {
    if (!message.content.startsWith(PREFIX) || message.author.bot) {
        return;
    }

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === BOT_CONFIG.list) {
        const tracked = await core.showClanList();
        message.channel.send(tracked.result);
    } else if (command === BOT_CONFIG.help) {
        message.channel.send("Command coming soon!");
    } else if (command === BOT_CONFIG.add || command === BOT_CONFIG.remove) {
        if (!args.length) {
            return message.channel.send(OK_EPTY.result);
        }

        const res = command === BOT_CONFIG.add ? await core.addNewClans(args) : await core.removeExistingClans(args);
        message.channel.send(res.result);
        message.channel.send(`Invalid clans: ${res.invalid}`);
    } else if (command === BOT_CONFIG.seed || command === BOT_CONFIG.check) {
        const list = await core.updateData(command === BOT_CONFIG.check);
        if (list.result) {
            return message.channel.send(list.result);
        }

        // TODO: Split this into another function. It is the only section to have significant
        //  logic in the command branch, making it very messy looking
        let reply = "";
        for (const playerId in list) {
            const player = list[playerId];
            
            let playerAndClan = `${player.nickname} left ${player.clan}`;
            playerAndClan = playerAndClan.replace(/_/g, "\\\_");
            reply += `${playerAndClan}\n${player.status}\n`;

            // Break it up into multiple messages to avoid breaking Discord
            if (reply.length > CHAR_LIMIT) {
                message.channel.send(reply);
                reply = "";
            }
        }
        message.channel.send(reply);
    }
});
