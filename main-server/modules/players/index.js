var players = [{
    id: 'Sophie Phonsec',
    score: 0,
    power: 0
}, {
    id: 'Jean Némar',
    score: 0,
    power: 0
}];

module.exports = {

    getPlayers: function () {
        return players;
    },

    getPlayerById: function (id) {
        for (var i in players) {
            if (players[i].id == id) {
                return players[i];
            }
        }
        return null;
    },

    registerPlayer: function (id) {
        if (players.length < 2) {
            players.push({
                id: id,
                score: 0,
                power: 0
            });
            return true;
        }
        return false;
    },

    deletePlayer: function (id) {
        for (var i in players) {
            if (players[i].id == id) {
                players.splice(i, 1);
                return true;
            }
        }
        return false;
    },

    incrScore: function (playerId) {
        for (var i in players) {
            if (players[i].id == playerId) {
                players[i].score++;
                return true;
            }
        }
        return false;
    },

    incrPower: function (playerId) {
        for (var i in players) {
            if (players[i].id == playerId) {
                players[i].power++;
                return true;
            }
        }
        return false;
    }

};