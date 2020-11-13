# ClanRecruitingBot
Author: Seth Kuipers

A Discord bot to help clans in World of Tanks with recruiting. This repository focuses on providing a fully featured, but highly customizable, Discord bot for a variety of clans.
  
### Prerequisites  
For this program to function properly you will need some additional items.  
1. Node.js 12+ installed on your system (https://nodejs.org/en/)
2. An application_id from Wargaming's developer portal here: https://developers.wargaming.net/applications/
    * This is specific to your account and should not be shared
3. PowerShell 3.0 or higher (Windows 7 or earlier only)
    * For anyone who uses Windows 8 or newer, you will already have a higher PowerShell version, so you may disregard
    * Otherwise, you will need to upgrade the version for the .bat file to run. New versions can be found here: https://docs.microsoft.com/en-us/powershell/scripting/install/installing-windows-powershell?view=powershell-6
4. A bot in your Discord server
    * You can follow these steps if needed: https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/
    * The bot needs to have read message and send messages permissions
5. In config_template.txt, change "App ID" to your Wargaming developer id, and "Bot token" to your Discord bot token. Keep the quotation marks. 
 
### Configurables
This section outlines how to use the config_template.txt file to get the most out of the application. The REQUIRED fields must be changed for the bot to function properly. All fields must be present in the configuration file - in the future the server will not start otherwise.

#### Required - Must change
1. application_id: "App ID"
    * How you access the Wargaming API.
2. token: "Bot token"
    * How you access your Discord bot.

#### Optional - If you want to customize
There is a number of ways you can customize the bot. Check out the documentation for a complete overview of what you can change.  
https://github.com/k-seth/ClanRecruitingBot/wiki/Customization

### Starting the program  
It is highly recommended you review the available commands prior to usage. A complete list of commands and their intended usage can be found here:  
https://github.com/k-seth/ClanRecruitingBot/wiki/Commands 
  
#### Windows
1. Navigate to the ClanRecruitingBot folder in the File Explorer
2. Double click "run.bat"
3. The bot will now be active in Discord

#### Linux
1. In terminal, navigate to the ClanRecruitingBot directory
2. Enter `sh run.sh`
3. The bot will now be active in Discord

  
### Known limitations  
- The server is sensitive to internet disconnections
    * This will be something to look into, but it is really an annoyance than an issue

  
Disclaimer: Use at your own discretion. There is no guaranteed of program stability.
