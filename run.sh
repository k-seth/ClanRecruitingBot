#!/bin/bash


# Setup environment
[ -d ./client ] && mv ./client/* ./app && rm -rf ./client
[ ! -f ./app/config.json ] && cp config_template.txt ./app/config.json
cd ./app

# Setup app
sed -i "s|// Modules|$(sed -n '17,19 p' ./modules.js)|g" ./app.js
sed -i "s|// Callback|$(sed -n '17,28 p' ./callback.js)|g" ./app.js

mkdir -p ./historical
npm install

# Run server
node -r esm ./app.js