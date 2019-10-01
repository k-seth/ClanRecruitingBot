# A Discord bot to help clans in World of Tanks with recruiting
# Copyright (C) 2019 Seth Kuipers

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

#!/bin/bash

# Setup environment
[ -d ./client ] && mv ./client/unix/* ./app && mv ./client/*.json ./app && rm -rf ./client
[ ! -f ./app/config.json ] && cp config_template.txt ./app/config.json
cd ./app

# Setup app
sed -i "s|// Modules|$(sed -n '17,20 p' ./modules.js)|g" ./app.js
sed -i "s|// Callback|$(sed -n '17,44 p' ./callback.js)|g" ./app.js

mkdir -p ./historical
npm install

# Run server
node -r esm ./app.js