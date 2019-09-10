#!/bin/bash

# Setup submodule
# cat ./client/modules.js >> ./app/modules.js
# cat ./client/callback.js >> ./app/app.js
# cp ./client/package.json ./app/
# Note: Running this script multiple times would cause the files to grow massive
# Figure out a way to only run if not already done
# Consider using sed command instead, that way the license isn't copied too?

# Setup environment
[ ! -f ./app/config.json ] && cp config_template.txt ./app/config.json
cd ./app
mkdir -p ./historical
npm install

# Run server
node -r esm ./app.js