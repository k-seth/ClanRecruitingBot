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
import Discord, { Message } from 'discord.js';
// @ts-ignore
import config from './config.json';
import { ClanManager } from './manager/clanManager';
import { PlayerManager } from './manager/playerManager';
import { ClanListService } from './service/clanListService';
import { PlayerListService } from './service/playerListService';
import { Util } from './util/util';

// Config constants
const botConfig = config.bot;
const commands = config.bot;
const prefix: string = botConfig.prefix;

// Other constants
const bot: Discord.Client = new Discord.Client();

const api = `https://api.worldoftanks${Util.determineRegionValues(config.app.server)}`;
const appId: string = config.app.application_id;

const clanListService: ClanListService = new ClanListService(config.clanList, api, appId);
const playerListService: PlayerListService = new PlayerListService();
const clanManager: ClanManager = new ClanManager(api, appId, clanListService);
const playerManager: PlayerManager = new PlayerManager(api, config.app, clanListService, playerListService);

// DISCORD FUNCTIONS

bot.login(botConfig.token);
bot.on('message', async (message: Message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args: string[] = message.content.slice(prefix.length).trim().split(/ +/);
    const command: string = args.shift().toLowerCase();

    // Ignore invalid commands
    if (commands.indexOf(command) === -1) {
        return;
    }

    let responseArray: string[];
    if (command === commands.list) {
        responseArray = await clanManager.showClanList();
    } else if (command === commands.help) {
        message.channel.send('Command coming soon!');
    } else if (command === commands.add || command === commands.remove) {
        responseArray = command === commands.add ? await clanManager.addNewClans(args) : await clanManager.removeExistingClans(args);
    } else if (command === commands.seed || command === commands.check) {
        responseArray = await playerManager.updateData(command === commands.check);
    }

    // Send the accumulated responses from the program
    // In general, this will only have one or two values, but there may be times where more are necessary
    for (const response of responseArray) {
        await message.channel.send(response);
    }
});
