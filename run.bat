:: A Discord bot to help clans in World of Tanks with recruiting
:: Copyright (C) 2019 Seth Kuipers

:: This program is free software: you can redistribute it and/or modify
:: it under the terms of the GNU General Public License as published by
:: the Free Software Foundation, either version 3 of the License, or
:: (at your option) any later version.

:: This program is distributed in the hope that it will be useful,
:: but WITHOUT ANY WARRANTY; without even the implied warranty of
:: MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
:: GNU General Public License for more details.

:: You should have received a copy of the GNU General Public License
:: along with this program.  If not, see <https://www.gnu.org/licenses/>.

:: Setup environment
if exist .\client (
    :: Should ensure that app.js is present.
    :: Not optimal. This will insert all the filfe, including license
    powershell -Command "& {$Callback = Get-Content -Path .\client\win\config.js; $Modules = Get-Content -Path .\client\win\config.js; $App = Get-Content -Path .\app\app.js; $App -replace '\\ Callback',$Callback | Set-Content -Path .\app\app.js; $App -replace '\\ Modules',$Modules | Set-Content -Path .\app\app.js}"
    move .\client\*.json
)
if exist .\client erase .\client
ren config_template.txt .\app\config.json
cd .\app

:: Setup app
if not exist .\historical mkdir .\historical
call npm install

:: Run server
node -r esm app.js

PAUSE