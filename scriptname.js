var Steam = require('steam');
var fs = require('fs');
var bot = new Steam.SteamClient();
 
if (fs.existsSync('sentryfile'))
{
    var sentry = fs.readFileSync('sentryfile');
    console.log('[STEAM] logging in with sentry ');
    bot.logOn({
      accountName: 'mikaeloferto',
      password: '',
      shaSentryfile: sentry
    });
}
else
{
    console.log('[STEAM] logging in without sentry');
    bot.logOn({
      accountName: 'mikaeloferto',
      password: '',
      authCode: ''
    });
}
bot.on('loggedOn', function() {
    console.log('[STEAM] Logged in.');
    bot.setPersonaState(Steam.EPersonaState.Online);
    //Tell steam we are playing games.
    //440=tf2
    //550=l4d2 
    //730=csgo
    //570=dota2
    bot.gamesPlayed([440, 550, 730, 570]);
});
 
bot.on('sentry', function(sentryHash)
{//A sentry file is a file that is sent once you have
//passed steamguard verification.
    console.log('[STEAM] Received sentry file.');
    fs.writeFile('sentryfile',sentryHash,function(err) {
    if(err){
      console.log(err);
    } else {
      console.log('[FS] Saved sentry file to disk.');
    }});
});
 
//Handle logon errors
bot.on('error', function(e) {
console.log('[STEAM] ERROR - Logon failed');
    if (e.eresult == Steam.EResult.InvalidPassword)
    {
    console.log('Reason: invalid password');
    }
    else if (e.eresult == Steam.EResult.AlreadyLoggedInElsewhere)
    {
    console.log('Reason: already logged in elsewhere');
    }
    else if (e.eresult == Steam.EResult.AccountLogonDenied)
    {
    console.log('Reason: logon denied - steam guard needed');
    }
})
