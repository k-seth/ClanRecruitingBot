BOT.login(BOTCONFIG.token);

// Callback that will be used by the program 
BOT.on("message", async function(message) {
    let runCheck = true;
    // Listen for messages that says the command specified in config.json. No else is used so that the channel can still be used for communication
    if (message.content !== BOTCONFIG.command && message.content !== BOTCONFIG.seed) {
        return;
    } else if (message.content === BOTCONFIG.seed) {
        runCheck = false;
    }

    let list = await getNewRosters(runCheck);
    message.reply(list); // Disable @user in response
});
