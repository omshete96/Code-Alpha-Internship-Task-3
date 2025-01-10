let players = [];

const addPlayer = (player) => {
    players.push(player);
};

const removePlayer = (playerId) => {
    players = players.filter(player => player.id !== playerId);
};

module.exports = { players, addPlayer, removePlayer };
