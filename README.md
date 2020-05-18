# ClanRecruitingBot
Author: Seth Kuipers

A Discord bot to help clans in World of Tanks with recruiting

##### Note: This repo is still in development and testing. While it may work, it is subject to change or instability.

This repository focuses on providing a fully featured, but highly customizable, Discord bot for a variety of clans. The bot comes set up for a mid to top clan on the NA server. Below are the default settings. Additionally, provided is an outline for how you can change the bot to suit your needs.
  
### Prerequisites  

For this program to function properly you will need some additional items.  
1. Node.js installed on your system (https://nodejs.org/en/)
2. An application_id from Wargaming's developer portal here: https://developers.wargaming.net/applications/
    * This is specific to your account and should not be shared
3. PowerShell 3.0 or higher (Windows 7 or earlier only)
    * For anyone using Windows 8, 8.1 or 10, you will already have PowerShell 3 or greater, so you may disregard
    * For those that are stubborn like myself, you will need to upgrade the version for the .bat file to run. New versions can be found here: https://docs.microsoft.com/en-us/powershell/scripting/install/installing-windows-powershell?view=powershell-6
4. An app with a bot in your Discord server
    * You can follow these steps if needed: https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/
    * The bot needs to have read message and send messages permissions
5. In config_template.txt, change "App ID" to your Wargaming developer id, and "Bot token" to your Discord bot token. Keep the quotation marks. 
 
### Configurables

This section outlines how to use the config_template.txt file to get the most out of the application. REQUIRED fields are ones you must edit, OPTIONAL are if you wish to personalize your app, such as adding new clans or changing servers. All fields must be present in the configuration file - in the future the server will not start otherwise.

#### Required - Must change

1. "application_id": "App ID"
    * How you access the Wargaming API.
2. "token": "Bot token"
    * How you access your Discord bot.

#### Optional - If you want to customize

1. "inactive_weeks": 2
    * Default = 2. The number of weeks since last battle before a player is 'inactive'. Value must be 1 or greater.
2. "server": "na"
    * Default = "na". The game server that the data comes from. Valid values: "na", "ru", "eu", "sea". If you change the server from na, you will need to redo the clan list.
3. "seed": "!new"
    * Default = "!new". The command to get fresh new data for the bot. Typically, only used when starting the bot for the first time or historical data has been deleted.
4. "check": "!left"
    * Default = "!left" The command to update the clan information and post it in Discord.
5. "list": "!show"
    * Default = "!show" The command to show all currently tracked clans.
6. "add": "!add",
    * Default = "!add" The command to add one or more clans for tracking.
    * Format: !add (ID) (ID) (ID)
7. "remove": "!remove"
    * Default = "!remove" The command to remove one or more clans from tracking.
    * Format: !remove (ID) (ID) (ID)

### Using the program  
  
#### Windows

1. Navigate to the ClanRecruitingBot folder in the File Explorer
2. Double click "run.bat"
3. The bot will now be active in Discord

#### Linux

1. In terminal, navigate to the ClanRecruitingBot directory
2. Enter `sh run.sh`
3. The bot will now be active in Discord

### Major Changes

- New commands for viewing and changing the clans the bot checks
    * After the command, include all clan ids one after another, separated by a space
- Improved handling of some errors to reduce crashes, and inform user about critical errors
- Added the server into the repository, and simplified setup
    * Changed structure of repo at the same time

### Trouble shooting
  
Below is a list of issues I have encountered in my testing. If something comes up that isn't listed, feel free to open an issue so that I can look into it. Specific error output and steps to reproduce the issue would be helpful.  
  
- Unknown
  
### Known limitations  
  
- The Windows script adds the entire file, not just the useful parts
   * This is not a priority

Default list of clans that are checked (Subject to name changes):  
<pre>  
- MAHOU : 1000016749  
- OTTER : 1000008386  
- -G-   : 1000002392  
- YOUJO : 1000043789  
- BULBA : 1000011903  
- 200IQ : 1000043236  
- BRVE  : 1000010647  
- SIMP  : 1000001960  
- CLAWS : 1000003319  
- YOLO  : 1000016051  
- PINGU : 1000020292  
- RELIC : 1000000017  
- VILIN : 1000002161  
- PLAIN : 1000052368
- THUGZ : 1000011108
- RDDT  : 1000001505
- F0CUS : 1000042946  
- ALERT : 1000016724  
- -ZOO- : 1000051474  
- -_W_- : 1000019152
</pre>  
  
Disclaimer: Use at own risk. Security and robustness not guaranteed.  