# ClanRecruitingBot
Author: Seth Kuipers

A Discord bot to help clans in World of Tanks with recruiting

### Note: This repo is still in development. The Linux bot does currently work, but is still IN PROGRESS, and as such may be buggy. This repo and the server are still under development and testing!

This repository focuses on providing a fully featured, but highly customizable, Discord bot for a variety of clans. When downloaded, the bot is set up for a mid to top clan on the NA server. Below are the default settings. Additionally, how you can change the bot to suit your needs is outlined. If you don't use Discord, or prefer not to add the bot, there is also a web browser based variant which can be found here: https://github.com/k-seth/ClanRecruitingWebapp.git
  
### Prerequisites  

For this program to function properly you will need some additional items.  
1. Node.js installed on your system (https://nodejs.org/en/)
2. An application_id from Wargaming's developer portal here: https://developers.wargaming.net/applications/  
   * This is specific to your account and should not be shared
3. An app with a bot in your Discord server
   * You can follow these steps if needed: https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/
   * The bot needs to have have read message and send messages permissions
4. In config_template.txt, change the value of "application_id" to your Wargaming developer id, and the value of "token" to your Discord bot token. Quotations are required around both
 
### Configurables

This section outlines how to use the config_template.txt file to get the most out of the application. REQUIRED fields are ones you must edit, OPTIONAL are if you wish to personalize your app, such as adding new clans or changing servers

1. "application_id": "Your App ID"
   * REQUIRED. How you access the Wargaming API
2. "inactive_weeks": 2
   * OPTIONAL, default = 2. The number of weeks since last battle before a player is labelled as inactive. Value must be 1 or greater
3. "server": "na"
   * OPTIONAL, default = "na". The game server that the data is taken from. Valid values: "na", "ru", "eu", "asia". If you change the server from na, you will need to redo the clan list
4. "token": "Your bot token"
   * REQUIRED. How you access your Discord bot
5. "seed": "!new"
   * OPTIONAL, default = "!new". The command to get fresh new data for the bot. Typically only used when starting the bot for the first time or historical data has been deleted
6. "command": "!left"
   * OPTIONAL, default = "!left" The command to update the clan information and post it in Discord
7. "clanlist": [ clan list ]
   * OPTIONAL, default = see bottom, all NA clans. The list of clans that are checked by the the bot. You can add additional clans, all you need is the clan's id.

### Using the program  
  
#### Windows

(Not currently working. Script is not set up)
1. Navigate to the ClanRecruitingBot folder in the File Explorer
2. Double click "run.bat"
3. The bot will now be active in Discord

#### Linux

(Untested changes. Functioned on last test, and only made minor script changes)
1. In terminal, navigate to the ClanRecruitingBot directory
2. Enter "sh run.sh"
3. The bot will now be active in Discord

### Trouble shooting
  
Below is a list of issues I have encountered in my testing. If something comes up that isn't listed, feel free to open an issue so I can look into it. Specific error output and steps to reproduce the issue would be helpful.  
  
- Unknown
  
### Known limitations  
  
- After a, currently undetermined and untested, period the bot can die. Output logging will be moved up the priority list (since the device I run the bot server on does not have a consistent monitor connection)

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
  
Disclaimer: Use at own risk. Security and robustness are not guaranteed.  