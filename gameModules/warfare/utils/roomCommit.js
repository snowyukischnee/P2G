module.exports = (room) => {
    room.lock = true;
    let guard = [[]], offensive = [[]];
    guard.length = offensive.length = room.players.length;
    for (let i = 0; i < guard.length; i++) guard[i] = offensive[i] = room.players.length;
    let name = {};
    for (let index = 0; index < room.players.length; index++) name[room.players[index].id] = index;
    console.log(name);
    for (let index = 0; index < room.players.length; index++) {
        for (let i = 0; i < 3; i++) {
            guard[index][i] = null;
            offensive[index][i] = null;
            if (room.players[index].action[i] != null) {
                console.log(room.players[index].action[i].target);
                if (room.players[index].action[i].type == 0) guard[index][i] = name[room.players[index].action[i].target];
                else if (room.players[index].action[i].type == 1) offensive[index][i] = name[room.players[index].action[i].target];
            } else {
                guard[index][i] = 0;
                offensive[index][i] = 0;
            }
        }
    }
    let diffPts = [];
    for (let index = 0; index < room.players.length; index++) {
        //change player hp
    }
    room.lock = false;
    return room;
}