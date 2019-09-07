:: Setup environment
ren config_template.txt .\app\config.json
cd .\app
if not exist .\historical mkdir .\historical
call npm install

:: Run server
node -r esm app.js

PAUSE