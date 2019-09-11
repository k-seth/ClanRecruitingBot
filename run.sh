#!/bin/bash

# Setup submodule
# sed -i '/\/\/ Insert other modules here/r modules.js' app.js
# sed -i '/\/\/ Insert callback here/r callback.js' app.js
# Next I should find and replace those 2 comments so that the seds will no longer add it

# Setup environment
[ ! -f ./app/config.json ] && cp config_template.txt ./app/config.json
cd ./app
mkdir -p ./historical
npm install

# Run server
node -r esm ./app.js