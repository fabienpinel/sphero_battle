var players = [{
    id: 'Sophie Phonsec',
    score: 0,
    power: 0
}, {
    id: 'Jean Némar',
    score: 0,
    power: 0
}];

var GAME_HORIZONTAL = 1000;
var GAME_VERTICAL = 1000;

var BALL_RADIUS = 50;


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
                power: 0,
                position: {
                    x: players.length == 1 ? GAME_HORIZONTAL - BALL_RADIUS : BALL_RADIUS,
                    y: players.length == 1 ? GAME_VERTICAL - BALL_RADIUS : BALL_RADIUS
                }
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
    },

    movePlayer: function (playerId, deltaX, deltaY) {
        for (var i in players) {
            if (players[i].id == playerId) {
                var newX = players[i].position.x + deltaX;
                var newY = players[i].position.y + deltaY;
                players[i].position.x = newX > GAME_HORIZONTAL - BALL_RADIUS ? GAME_HORIZONTAL - BALL_RADIUS : (newX < BALL_RADIUS ? BALL_RADIUS : newX);
                players[i].position.x = newY > GAME_VERTICAL - BALL_RADIUS ? GAME_VERTICAL - BALL_RADIUS : (newY < BALL_RADIUS ? BALL_RADIUS : newY);
                return true;
            }
        }
        return false;
    }

};