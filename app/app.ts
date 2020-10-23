// A Discord bot for watching World of Tanks clans
// Copyright (C) 2019-2020 Seth Kuipers

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
import Discord from 'discord.js';
// @ts-ignore
import config from './config.json';
import { ClanManager } from './manager/clanManager';
import { DataManager } from './manager/dataManager';
import { ClanListService } from './service/clanListService';
import { Util } from './util/util';

// Config constants
const BOT_CONFIG = config.bot;
const PREFIX = BOT_CONFIG.prefix;

// Success constants
const OK_EMPTY = 'No clans supplied. No action taken';

// Other constants
const BOT = new Discord.Client();

const api = `https://api.worldoftanks${Util.determineRegionValues(config.app.server)}`;

const clanListService = new ClanListService(config.clanList);
const clanManager = new ClanManager(api, config.app.application_id, clanListService);
const dataManager = new DataManager(config, clanListService);

// DISCORD FUNCTIONS

BOT.login(BOT_CONFIG.token);
BOT.on('message', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) {
        return;
    }

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    let responseArray: string[];
    if (command === BOT_CONFIG.list) {
        responseArray = await clanManager.showClanList();
    } else if (command === BOT_CONFIG.help) {
        message.channel.send('Command coming soon!');
    } else if (command === BOT_CONFIG.add || command === BOT_CONFIG.remove) {
        if (!args.length) {
            return message.channel.send(OK_EMPTY);
        }

        responseArray = command === BOT_CONFIG.add ? await clanManager.addNewClans(args) : await clanManager.removeExistingClans(args);
    } else if (command === BOT_CONFIG.seed || command === BOT_CONFIG.check) {
        responseArray = await dataManager.updateData(command === BOT_CONFIG.check);
    }  else {
        return;
    }

    // Send the accumulated responses from the program
    // In general, this should only have one or two values, but there may be times where more are necessary
    responseArray.forEach(value => message.channel.send(value));
});