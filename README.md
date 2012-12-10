# Steam for Node.js

This is a Node.js port of [SteamKit2](https://bitbucket.org/VoiDeD/steamre/wiki/Home). It lets you interface with Steam without running an actual Steam client. Could be used to run an autonomous chat/trade bot.

The API is scarce compared to SteamKit2 - however, most chat and trade functions are implemented.


# Installation

```
npm install steam
```

# Usage
First, `require` this module.
```js
var Steam = require('steam');
```
`Steam` is now a namespace (implemented as an object) containing the `SteamClient` class and a huge collection of enums (implemented as objects). More on those below.

Then you'll want to create an instance of `SteamClient`, call its `logOn` method and assign event listeners.

```js
var bot = new Steam.SteamClient();
bot.logOn('username', 'password');
bot.on('loggedOn', function() { /* ... */});
```

See example.js for the usage of some of the available API.

# SteamID

Since JavaScript's `Number` type does not have enough precision to store 64-bit integers, SteamIDs are represented as decimal strings. (Just wrap the number in quotes)

# Enums

Whenever a method accepts (or an event provides) an `ESomething`, it's a `Number` that represents some enum value. See [steam_language.js](node-steam/tree/master/lib/generated/steam_language.js) for the whole list of them.

Note that you can't easily get the string value from the number, but you probably don't need to. You can still use them in conditions (e.g. `if (type == Steam.EChatEntryType.Emote) ...`) or switch statements.

# Properties

## steamID

Your own SteamID.

## users

Information about users you have encountered. It's an object with the following structure:

```js
{
  "steamID of the user": {
    playerName: "the user's current profile name",
    gameName: "the title of the game the user is currently playing"
    // ...and other properties that come directly from Steam
  }
  // ...other users
}
```

## chatRooms

Information about chat rooms you have joined. It's an object with the following structure:
```js
{
  "steamID of the chat": {
    "steamID of one of the chat's current members": {
      rank: "EClanPermission",
      permissions: "a bitset of values from EChatPermission"
    }
    // other members
  }
  // other chats
}
```

For example, `Object.keys(steamClient.chatRooms[chatID])` will return an array of the chat's current members, and `steamClient.chatRooms[chatID][memberID].permissions & Steam.EChatPermission.Kick` will evaluate to a nonzero value if the specified user is allowed to kick from the specified chat.

# Methods

## logOn(username, password, [authCode])

Connects to Steam and logs you on upon connecting. Optionally, `authCode` is your SteamGuard code.

## setPersonaName(name)

Changes your Steam profile name.

## setPersonaState(state)

`state` is `EPersonaState`. You'll want to call this with `EPersonaState.Online` upon logon, otherwise you'll show up as offline.

## sendMessage(target, message, [type])
`target` is the SteamID of a user or a chat. `type` equals `EChatEntryType.ChatMsg` if not specified. Another type you might want to use is `EChatEntryType.Emote`.

## joinChat(steamID)

Joins the chat room of the specified group. Go to the group's Community page, press Ctrl+U and search for "joinchat". Will silently fail if you are not allowed to join.

## kick(steamIdChat, steamIdMember)
## ban(steamIdChat, steamIdMember)
## unban(steamIdChat, steamIdMember)

Self-explanatory.

## trade(user)

Sends a trade request to the specified SteamID.

## respondToTrade(tradeId, acceptTrade)

Same `tradeId` as the one passed through the `tradeProposed` event. `acceptTrade` should be `true` or `false`.

## cancelTrade(user)

Cancels your proposed trade to the specified SteamID.

# Events

## 'connected'

For informative purposes only. Emitted after a successful encryption handshake.

## 'loggedOn'

You can now safely use all API.

## 'webLoggedOn'
* `sessionID`
* `token`

You can use the callback arguments to construct a cookie to access Steam Community web functions without a separate login.

## 'loggedOff'
* `result` - `EResult`, the reason you were logged off

Do not use any API now, wait until it reconnects (hopefully).

## 'chatInvite'
* `chat` - SteamID of the chat you were invited to
* `chatName` - name of the chat
* `patron` - SteamID of the user who invited you

## 'friendMsg'
* `from` - SteamID of the user
* `message` - the message
* `msgType` - `EChatEntryType`

## 'chatMsg'
* `chatRoom` - SteamID of the chat room
* `message` - the message
* `msgType` - `EChatEntryType`
* `chatter` - SteamID of the user

## 'message'
Same arguments as the above two, captures both events. In case of a friend message, `chatter` will be undefined.

## 'chatStateChange
* `stateChange` - `EChatMemberStateChange`
* `chatterActedOn` - SteamID of the user who entered or left the chat room, disconnected, or was kicked or banned
* `steamIdChat` - SteamID of the chat where it happened
* `chatterActedBy` - SteamID of the user who kicked or banned

Something happened in a chat you are in. For example, if `stateChange == Steam.EChatMemberStateChange.Kicked`, then someone got kicked.

## 'tradeProposed'
* `tradeID`
* `otherClient` - SteamID
* `otherName` - seems to be always empty

You were offered a trade.

## 'tradeResult'
* `tradeID`
* `response` - `EEconTradeResponse`
* `otherClient` - SteamID of the user you sent a trade request

Listen for this event if you are the one sending a trade request.

## 'sessionStart'
* `otherClient`

The trade is now available at http://steamcommunity.com/trade/{otherClient}. You need a cookie as described in `webLoggedOn`. You can use [node-steam-trade](https://github.com/seishun/node-steam-trade) to automate the trade itself.

## 'announcement'
* `group` - SteamID
* `headline`

Use the group's RSS feed to get the body of the announcement if you want it.