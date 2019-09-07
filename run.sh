#!/bin/bash

# Setup environment
[ ! -f ./app/config.json ] && cp config_template.txt ./app/config.json
cd ./app
mkdir -p ./historical
npm install

# Run server
node -r esm ./app.js