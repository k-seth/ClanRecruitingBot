:: Setup environment
ren config_template.txt .\app\config.mjs
cd .\app
if not exist .\historical mkdir .\historical
call npm install

:: Run server
node app.js

PAUSE