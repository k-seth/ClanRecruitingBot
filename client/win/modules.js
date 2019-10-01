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

import Discord from "discord.js";
const BOT = new Discord.Client();
const BOT_CONFIG = config.bot;
const CHAR_LIMIT = 1850 // Discord has a 2000 character limit. 1850 is to be safe
