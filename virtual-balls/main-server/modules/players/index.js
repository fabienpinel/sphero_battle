var GAME_HORIZONTAL = 1000;
var GAME_VERTICAL = 1000;
var BALL_RADIUS = 50;

var players = [{
    id: "player1",
    score: 0,
    power: 0,
    position: {
        x: BALL_RADIUS + 200,
        y: BALL_RADIUS + 200
    },
    history: [{x: 0, y: 0},{x: 0, y: 0}]
}, {
    id: "player2",
    score: 0,
    power: 0,
    position: {
        x: GAME_HORIZONTAL - BALL_RADIUS,
        y: GAME_VERTICAL - BALL_RADIUS
    },
    history: [{x: 0, y: 0},{x: 0, y: 0}]
}];

function _findNewPosition(playerId, newX, newY, previousX, previousY) {

    var returnValue = {
        newX: newX,
        newY: newY
    };

    var isBeforeX = returnValue.newX < BALL_RADIUS;
    var isAfterX = returnValue.newX > GAME_HORIZONTAL - BALL_RADIUS;
    var isBeforeY = returnValue.newY < BALL_RADIUS;
    var isAfterY = returnValue.newY > GAME_VERTICAL - BALL_RADIUS;

    // collision avec mur
    if (isBeforeX) {
        returnValue.newX = BALL_RADIUS;
    } else if (isAfterX) {
        returnValue.newX = GAME_HORIZONTAL - BALL_RADIUS;
    }

    if (isBeforeY) {
        returnValue.newY = BALL_RADIUS;
    } else if (isAfterY) {
        returnValue.newY = GAME_VERTICAL - BALL_RADIUS;
    }

    if (isBeforeX || isAfterX || isBeforeY || isAfterY) {
        //console.log('collision contre le mur');
    }

    // collision avec joueur
    if (players.length > 1) {
        var otherPlayerPosition = null;
        for (var i in players) {
            if (players[i].id != playerId) {
                otherPlayerPosition = players[i].position;
                var x = returnValue.newX - players[i].position.x;
                var y = returnValue.newY - players[i].position.y;
                var distanceBetweenCenters =  Math.sqrt(
                    Math.pow(x, 2)
                    + Math.pow(y, 2)
                );
                if (distanceBetweenCenters < 2 * BALL_RADIUS) {
                    returnValue.newX = players[i].position.x + (x * 2 * BALL_RADIUS / distanceBetweenCenters);
                    returnValue.newY = players[i].position.y + (y * 2 * BALL_RADIUS / distanceBetweenCenters);

                    // TODO : check who has the biggest speed. Then take the biggest speed and recurse on it for the looser

                    // TODO : if not impacted within the last 1s
                    var deltaX = previousX - players[i].position.x;
                    var deltaY = previousY - players[i].position.y;
                    _recurseImpact(
                        players[i].id,
                        deltaX > 0 ? deltaX - BALL_RADIUS : deltaX + BALL_RADIUS,
                        deltaY > 0 ? deltaY - BALL_RADIUS : deltaY + BALL_RADIUS,
                        0
                    );
                }

                break;
            }
        }
    }
    return returnValue;
}

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
        if (deltaX > BALL_RADIUS) { deltaX = BALL_RADIUS - 1; }
        if (deltaY > BALL_RADIUS) { deltaY = BALL_RADIUS - 1; }
        if (deltaX < - BALL_RADIUS) { deltaX = - BALL_RADIUS + 1; }
        if (deltaY < - BALL_RADIUS) { deltaY = - BALL_RADIUS + 1; }

        for (var i in players) {
            if (players[i].id == playerId) {
                var newPosition = _findNewPosition(
                    playerId,
                    players[i].position.x + parseInt(deltaX),
                    players[i].position.y + parseInt(deltaY),
                    players[i].position.x,
                    players[i].position.y
                );
                players[i].position.x = newPosition.newX;
                players[i].position.y = newPosition.newY;

                return true;
            }
        }
        return false;
    },

    memorizeHistory: function () {
        setInterval(function () {
            for (var i in players) {
                players[i].history.push(players[i].position);
                players[i].history.shift();
            }
        }, 60);
    }

};

var sockets = require('../sockets');
function _recurseImpact(playerId, deltaX, deltaY, index) {
    for (var i in players) {
        if (players[i].id == playerId) {
            players[i].position.x -= deltaX;
            players[i].position.y -= deltaY;
            if (players[i].position.x < BALL_RADIUS) players[i].position.x = BALL_RADIUS;
            if (players[i].position.y < BALL_RADIUS) players[i].position.y = BALL_RADIUS;
            if (players[i].position.x > GAME_HORIZONTAL - BALL_RADIUS) players[i].position.x = GAME_HORIZONTAL - BALL_RADIUS;
            if (players[i].position.y > GAME_VERTICAL - BALL_RADIUS) players[i].position.y = GAME_VERTICAL - BALL_RADIUS;
            sockets.emitChanges();
            break;
        }
    }
    if (index < 100 && (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1)) {
        setTimeout(function () {
            _recurseImpact(playerId, deltaX / 1.3, deltaY / 1.3, index + 1);
        }, 60);
    }
}