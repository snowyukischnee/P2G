module.exports = (room) => {
    let guard = [[]];
    let offensive = [[]];
    let name = {};
    for (let index = 0; index < room.players.length; index++) name[room.players[index].id] = index;
    for (let index = 0; index < room.players.length; index++) {
        for (let i = 0; i < 3; i++) {
            if (room.players[index].action[i] != null) console.log(room.players[index].action[i].type + " " + name[room.players[index].action[i].target]); else console.log(null);
        }
    }
    return room;
}