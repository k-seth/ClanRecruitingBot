#!/bin/bash

# Setup environment
[ ! -f ./app/config.mjs ] && cp config_template.txt ./app/config.mjs
cd ./app
mkdir -p ./historical
npm install

# Run server
node ./app.js