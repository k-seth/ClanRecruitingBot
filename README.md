# ClanRecruitingBot
Author: Seth Kuipers

A Discord bot to help clans in World of Tanks with recruiting. This repository focuses on providing a fully featured, but highly customizable, Discord bot for a variety of clans. The bot comes set up for a mid to top clan on the NA server. Below are the default settings. Additionally, provided is an outline for how you can change the bot to suit your needs.
  
### Prerequisites  

For this program to function properly you will need some additional items.  
1. Node.js installed on your system (https://nodejs.org/en/)
2. An application_id from Wargaming's developer portal here: https://developers.wargaming.net/applications/
    * This is specific to your account and should not be shared
3. PowerShell 3.0 or higher (Windows 7 or earlier only)
    * For anyone who uses Windows 8 or newer, you will already have a higher PowerShell version, so you may disregard
    * Otherwise, you will need to upgrade the version for the .bat file to run. New versions can be found here: https://docs.microsoft.com/en-us/powershell/scripting/install/installing-windows-powershell?view=powershell-6
4. An app with a bot in your Discord server
    * You can follow these steps if needed: https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/
    * The bot needs to have read message and send messages permissions
5. In config_template.txt, change "App ID" to your Wargaming developer id, and "Bot token" to your Discord bot token. Keep the quotation marks. 
 
### Configurables

This section outlines how to use the config_template.txt file to get the most out of the application. REQUIRED fields are ones you must edit, OPTIONAL are if you wish to personalize your app, such as adding new clans or changing servers. All fields must be present in the configuration file - in the future the server will not start otherwise.

#### Required - Must change

1. application_id: "App ID"
    * How you access the Wargaming API.
2. token: "Bot token"
    * How you access your Discord bot.

#### Optional - If you want to customize

1. inactive_weeks: 2
    * Feature - The number of weeks since last battle before a player is 'inactive'. This feature will be disabled when set equal to or less than 0.
2. server: "na"
    * Feature - The game server that the data comes from. Valid values: "na", "ru", "eu", "sea". If you change the server from na, you will need to redo the clan list.
3. prefix: "!"
    * The unique character used to distinguish a command. "!" is a fairly common prefix, so changing it can help if you have other bots that already use it.
4. seed: "new"
    * Command - Get fresh new data for the bot. Typically, only used when starting the bot for the first time or historical data has been deleted.
    * Default usage: !new
5. check: "left"
    * Command - Update the clan information and post it in Discord.
    * Default usage: !left
6. list: "show"
    * Command - Show all currently tracked clans.
    * Default usage: !show
7. add: "add",
    * Command - Add one or more clans for tracking.
    * Default usage: !add (ID) (ID) (ID)
8. remove: "remove"
    * Command - Remove one or more clans from tracking.
    * Default usage: !remove (ID) (ID) (ID)

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
- Improved handling of some errors to reduce crashes, and inform user about critical errors
- Showing the list of all tracked clans includes the clan tag now

### Trouble shooting
  
Below is a list of issues I have encountered in my testing. If something comes up that isn't listed, feel free to open an issue so that I can look into it. Specific error output and steps to reproduce the issue would be helpful.  
  
- Unknown
  
### Known limitations  
  
- The server is sensitive to internet disconnections
    * This will be something to look into, but it is really an annoyance than an issue

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
