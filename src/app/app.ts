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
import { ApiService } from './service/apiService';
import { ClanListService } from './service/clanListService';
import { ClanManager } from './manager/clanManager';
import { ConfigService } from './service/configService';
import { PlayerListService } from './service/playerListService';
import { PlayerManager } from './manager/playerManager';

// Other constants
const bot: Discord.Client = new Discord.Client();
const configService: ConfigService = new ConfigService();
const apiService: ApiService = new ApiService(configService);
const clanListService: ClanListService = new ClanListService(apiService, configService);
// const playerListService: PlayerListService = new PlayerListService();
const clanManager: ClanManager = new ClanManager(apiService, configService, clanListService);
const playerManager: PlayerManager = new PlayerManager(apiService, configService, clanListService);

void bot.login(configService.token());

// eslint-disable-next-line complexity
bot.on('message', async (message: Message) => {
    const restricted = configService.getRestrictedChannels();
    const commands = configService.getCommands();

    // If the message is sent in a channel the bot is not restricted to, ignore
    if (!!restricted.size && !restricted.has(message.channel.id)) {
        return;
    }

    // If the message is not in command format or is from a bot, ignore
    if (!message.content.startsWith(configService.getPrefix()) || message.author.bot) {
        return;
    }

    const args: string[] = message.content.slice(configService.getPrefix().length).trim().split(/ +/);
    const command: string = args.shift().toLowerCase();

    // If the command is not recognized, ignore
    if (!Array.from(configService.getCommands().values()).includes(command)) {
        return;
    }

    let responseArray: string[];
    if (command === commands.get('list')) {
        responseArray = clanManager.showClanList();
    } else if (command === commands.get('help')) {
        await message.channel.send('Command coming soon!');
    } else if (command === commands.get('add')) {
        responseArray = await clanManager.addClans(args);
    } else if (command === commands.get('remove')) {
        // Pre-emptively remove duplicates
        const set = new Set<string>(args);
        responseArray = clanManager.removeClans(Array.from(set));
    } else if (command === commands.get('seed')) {
        responseArray = await playerManager.updatePlayerData(false);
    } else if (command === commands.get('check')) {
        responseArray = await playerManager.updatePlayerData(true);
    }

    // Send the accumulated responses from the program
    // In general, this will only have one or two values, but there may be times where more are necessary
    for (const response of responseArray) {
        await message.channel.send(response);
    }
});
