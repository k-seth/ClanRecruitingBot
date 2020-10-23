:: A Discord bot to help clans in World of Tanks with recruiting
:: Copyright (C) 2019-2020 Seth Kuipers

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
ren config_template.txt config.json

:: Setup app
if not exist .\app\historical mkdir .\app\historical
call npm install

:: Run server
call npm start

PAUSE
