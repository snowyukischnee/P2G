# P2G
>P2G is source code (server-side only) of the game project developed by **No Game No Life** team of **SE1106** class. This game is group project assignment of **SWE102** course

## Technologies used
P2G using [Express.js](https://expressjs.com/) and [Socket.io](https://socket.io/) to write the game server.
The server communicate with the client by [Socket.io](https://socket.io/) through web socket to make it's easier to build multi-platform game with the source will not be changed too much
## QuickStart
P2G require [Node.js](https://nodejs.org/) v7+ and [npm](https://www.npmjs.com/) v5+ to run
### Development mode
Install the dependencies and start the server.
```sh
$ cd P2G
$ npm install
$ npm start
```
### Production mode
For Ubuntu/Linux and OSX
```sh
$ cd P2G
$ npm install
$ export NODE_ENV=production
$ npm start
```
For Windows (using PowerShell)
```powershell
$ cd P2G
$ npm install
$ $env:NODE_ENV="production"
$ npm start
```
after finished the installation, go to the browser and go to the following address
```sh
localhost:3000
```
## Documentation (for client-side)
First, connect to the Socket.io server
```javascript
let io = ('/warfare')
```
### Emit
#### find_game
```javascript
socket.emit('find_game', data)
```
* `data`(Object)
	* `name`(String): player's ingame name
	
used to find game
#### leave_room
```javascript
socket.emit('leave_room')
```
used to leave room while ingame or while in waiting for other players, automatically called when disconnected
#### get_info
```javascript
socket.emit('get_info')
```
used to get player information (`id`, `hp`, `action`,..) by trigger `player` event
#### action_on
```javascript
socket.on('action_on', (data))
```
* `data`(Array, 3 elements): array to store player current prompted move
	* `i-th element`(Object)
		* `type`(Number): type of move (`0`: Defense, `1`: Attack)
		* `target`(String): the id of the socket that move target to
		
used to prompted the moves in the current phase ingame
#### action_off
```javascript
socket.emit('action_off')
```
clear all move that player prompted in the current phase ingame
#### give
```javascript
socket.emit('give', data)
```
* `data`(Object)
    * `id`(String): target player's id to give
    * `ammount`(Number): ammount of hp to send
    
player send a ammount of hp to targeted player, hp for sending must be positive integer and <= 2
#### spy(CURRENTLY NOT IMPLEMENTED)
#### chat_all(CURRENTLY NOT IMPLEMENTED)
#### chat(CURRENTLY NOT IMPLEMENTED)
#### debug_obs (DEBUG_ONLY)(WILL BE REMOVED IN GAME)
```javascript
socket.emit('debug_obs')
```
observe all information of the room which have that player's playing by trigger socket `debug_obs_result` event
### Listener
#### time
```javascript
socket.on('time', callback(time))
```
* `time`(Number)

the current time when game started, emitted by server
#### counter
```javascript
socket.on('counter', callback(time))
```
* `time`(Number)

the current count down time in current phase when game started, emitted by server
#### current_phase
```javascript
socket.on('current_phase', callback(phase))
```
* `phase`(Number)

the current phase, emitted by server
#### players
```javascript
socket.on('players', callback(players))
```
* `players`(Array)

array of socket id of players in room
#### player
```javascript
socket.on('player', callback(player))
```
* `player`(Object): All information about player
	* `id`(String): player's id, same with socket id
	* `name`(String): player's ingame name
	* `room`(String): player's room id
	* `hp`(Number): player's current HP
	* `alias`(Number): player's alias in room (since room have maximum 4 players, alias ranged from 0 to 3)
	* `action`(Array, fixed length, 3 elements): store player's action in current phase ingame, `null` if player don't prompt that move
		* `type`(Number): type of move (`0`: Defense, `1`: Attack)
		* `target`(Socket id): the id of the socket that move target to
		
player all information, triggered by `get_info` event
#### update
```javascript
socket.on('update')
```
used by server to force player to refresh data
#### leave_game
```javascript
socket.on('leave_game')
```
used by server to force player to leave room
#### game_ended
```javascript
socket.on('game_ended')
```
used by server to notify player that game's ended, also mean player is the winner
#### debug_message(DEBUG_ONLY)
```javascript
socket.on('debug_message', callback(message))
```
debug message sent by server
message sent by server used to debug
#### debug_obs_result(DEBUG_ONLY)(WILL BE REMOVED IN GAME)
```javascript
socket.on('debug_obs_result', callback(room))
```
* `room`(Object)
	* `gameName`(String): game name hosted in room
	* `id`(String): room's id
	* `players`(Array): array of players in the current phase)
	* `prevPlrs`(Array): array of players in the previous phase)
	* `lock`(Boolean): used to lock object to evade exception
	* `data`(Object)
		* `playing`(Boolean): playing state of room
		* `started`(Number): timestamp when game started
		* `phase`(Object): data of current phase ingame
			* `spyStates`(Number): state of `spy` used by player, stored using player's alias and bit operators
			* `actionStates`(Number): state of prompted `action` used by player, stored using player's alias and bit operators
			* `giveStates`(Number): state of `give` used by player, stored using player's alias and bit operators
			* `started`(Number): timestamp when phase started
			
result sent by server, triggered by `debug_obs` event
#### err(DEBUG_ONLY)
```javascript
socket.on('err', callback(message))
```
error message sent by server
## Author
tuannhse04791
