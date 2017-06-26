'use strict'
const roomPlacement = require('../utils/roomUtils');
const action = require('../classes/action');
const bitOperator = require('../utils/bitOperator');

function exists(obj) {
    return typeof obj !== 'undefined';
}

function valid(data, roomPlacement, sid) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i != j && data[i].type == data[j].type && data[i].target == data[j].target) return false;
        }
    }
    for (let i = 0; i < 3; i++) {
        if (data[i].type != 0 && data[i].type != 1) return false;
        if (sid == data[i].target) return false;
        if (roomPlacement.findRoomId(sid) != roomPlacement.findRoomId(data[i].target)) return false;
    }
    return true;
}

function isInt(value) {
    let x;
    return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}


module.exports = (io) => {
    const gameName = 'warfare';
    const maxPlayer = 4;
    let namespace = io.of(gameName);
    const roomPlcm = new roomPlacement(namespace, gameName, maxPlayer);
    namespace.on('connection', (socket) => {
        //--------------handle on event socket connection----------------------
        socket.on('find_game', (data) => {
            roomPlcm.joinRoom(socket, data.name);
        });
        socket.on('leave_room', () => {
            roomPlcm.leaveRoom(socket);
        });
        socket.on('disconnect', () => {
            roomPlcm.leaveRoom(socket);
        });
        //--------unnessessary---
        /*socket.on('check_sid', (sid) => {
            if (socket.id == sid) socket.emit('check_sid_result_rollback');
            else if (roomPlcm.findRoomId(sid) == roomPlcm.findRoomId(socket.id)) socket.emit('check_sid_result_commit');
            else socket.emit('check_sid_result_rollback');
        });*/
        //----------------
        socket.on('get_info', () => {
            let player = roomPlcm.findPlayer(socket.id);
            if (exists(player)) {
                socket.emit('player', player);
            }
        });
        socket.on('action_on', (data) => {
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'action_on:room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            if (exists(room) && exists(player) && !bitOperator.getBit(room.data.phase.actionStates, player.alias)) {
                room.data.phase.actionStates = bitOperator.onBit(room.data.phase.actionStates, player.alias);
                if (exists(data) && data.length >= 3 && valid(data, roomPlcm, socket.id)) {
                    player.action[0] = new action(data[0].type, data[0].target);
                    player.action[1] = new action(data[1].type, data[1].target);
                    player.action[2] = new action(data[2].type, data[2].target);
                } else {
                    socket.emit('err', 'action_on:data not valid');
                }
            } else {
                socket.emit('err', 'action_on:state is currently on, switch off before turn on again');
            }
        });
        socket.on('action_off', () => {
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'action_off:room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            console.log(player.alias)
            if (exists(room) && exists(player) && bitOperator.getBit(room.data.phase.actionStates, player.alias)) {
                room.data.phase.actionStates = bitOperator.offBit(room.data.phase.actionStates, player.alias);
                player.action[0] = null;
                player.action[1] = null;
                player.action[2] = null;
            } else {
                socket.emit('err', 'action_on:state is currently off, switch on before turn off again');
            }
        });
        socket.on('spy', (data) => {
            if (socket.id == data.id) {
                socket.emit('err', 'spy:can not spy to self');
                return;
            }
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'spy:room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            let targetPlayer = roomPlcm.findPlayer(data.id);
            if (exists(room) && exists(player) && exists(targetPlayer) && !bitOperator.getBit(room.data.phase.spyStates, player.alias)) {
                room.data.phase.spyStates = bitOperator.onBit(room.data.phase.spyStates, player.alias);
                for (let index = 0; index < room.prevPlrs.length; index++) {
                    if (room.prevPlrs[index].id == data.id) {
                        socket.emit('spy_result', {
                            hp: room.prevPlrs[index].hp,
                            action: room.prevPlrs[index].action
                        });
                        break;
                    }
                }
                player.hp -= 1;
                socket.emit('update');
            } else {
                socket.emit('err', 'spy:spy alreadly used');
            }
        });
        socket.on('give', (data) => {
            if (socket.id == data.id) {
                socket.emit('err', 'give:can not give to self');
                return;
            }
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'give:room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            let targetPlayer = roomPlcm.findPlayer(data.id);
            if (exists(room) && exists(player) && exists(targetPlayer) && !bitOperator.getBit(room.data.phase.giveStates, player.alias)) {
                if (exists(data.ammount) && isInt(data.ammount) && data.ammount <= 2 && data.ammount >= 0) {
                    room.players[player.alias].hp -= data.ammount;
                    room.players[targetPlayer.alias].hp += data.ammount;
                    room.data.phase.spyStates = bitOperator.onBit(room.data.phase.giveStates, player.alias);
                    socket.emit('update');
                    namespace.to(targetPlayer.id).emit('update');
                } else {
                    socket.emit('err', 'give:give ammount not valid');
                }
            } else {
                socket.emit('err', 'give:give already used');
            }
        });
        socket.on('chat', (data) => {
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'chat:room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            if (data.target != null) {
                let targetPlayer = roomPlcm.findPlayer(data.target);
                if (exists(targetPlayer)) {
                    namespace.to(targetPlayer.id).emit('message', {
                        type: 1,
                        source: {
                            id: player.id,
                            name: player.name,
                            alias: player.alias
                        },
                        message: data.message
                    });
                }
            } else {
                namespace.to(room.id).emit('message', {
                    type: 0,
                    source: {
                        id: player.id,
                        name: player.name,
                        alias: player.alias
                    },
                    message: data.message
                });
            }
        });
        //--------------debug-----------------------------------------
        socket.on('debug_obs', () => {
            socket.emit('debug_obs_result', roomPlcm.findRoom(socket));
        });
    })
    return io;
}
