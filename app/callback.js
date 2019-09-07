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

// Modules imported by the program
import config from "./config.js";
import Discord from "discord.js";

// Constants used
const bot = new Discord.Client();
const confBot = config.bot;

bot.login(confBot.token);

// Callback that will be used by the program 
bot.on("message", async function(message) {
    let runCheck = true;
    // Listen for messages that says the command specified in config.json. No else is used so that the channel can still be used for communication
    if (message.content !== confBot.command && message.content !== confBot.seed) {
        return;
    } else if (message.content === confBot.seed) {
        runCheck = false;
    }

    let list = await getNewRosters(runCheck);
    message.reply(list); // Disable @user in response
});