var sockets = require('../sockets');
var spells = require('./spells.js');

var GAME_HORIZONTAL = 1000;
var GAME_VERTICAL = 1000;
var BALL_RADIUS = 50;

var GAME_DURATION = 60 * 1000;

var SPELLS = {
    SLOW_DOWN: 'SLOW_DOWN',
    CONTROL_REVERSAL: 'CONTROL_REVERSAL',
    HEAL: 'HEAL',
    IMMUNITY: 'IMMUNITY'
};

var players = [/*{
    id: "player1",
    score: 0,
    power: 0,
    position: {
        x: BALL_RADIUS,
        y: BALL_RADIUS
    },
    lastImpact: Date.now(),
    history: [
        { x: BALL_RADIUS, y: BALL_RADIUS },
        { x: BALL_RADIUS, y: BALL_RADIUS }
    ],
    spell: SPELLS.IMMUNITY
}, {
    id: "player2",
    score: 0,
    power: 0,
    position: {
        x: GAME_HORIZONTAL - BALL_RADIUS,
        y: GAME_VERTICAL - BALL_RADIUS
    },
    lastImpact: Date.now(),
    history: [
        { x: GAME_HORIZONTAL - BALL_RADIUS, y: GAME_VERTICAL - BALL_RADIUS },
        { x: GAME_HORIZONTAL - BALL_RADIUS, y: GAME_VERTICAL - BALL_RADIUS }
    ],
    spell: SPELLS.SLOW_DOWN
}/**/];
var timeout = null;

function _findNewPosition(player, newX, newY) {

    // CONST DEFINITIONS
    var previousX = player.position.x;
    var previousY = player.position.y;
    var returnValue = { newX: newX, newY: newY };
    var isBeforeX = returnValue.newX < BALL_RADIUS;
    var isAfterX = returnValue.newX > GAME_HORIZONTAL - BALL_RADIUS;
    var isBeforeY = returnValue.newY < BALL_RADIUS;
    var isAfterY = returnValue.newY > GAME_VERTICAL - BALL_RADIUS;

    // collision avec mur
    if (isBeforeX) returnValue.newX = BALL_RADIUS;
    else if (isAfterX) returnValue.newX = GAME_HORIZONTAL - BALL_RADIUS;
    if (isBeforeY) returnValue.newY = BALL_RADIUS;
    else if (isAfterY) returnValue.newY = GAME_VERTICAL - BALL_RADIUS;

    if ((isBeforeX || isAfterX || isBeforeY || isAfterY) && player.spellEffect != SPELLS.IMMUNITY) {
        player.lastImpact = Date.now();
        sockets.collision([player.id]);
    }

    // collision avec joueur
    if (players.length > 1) {
        var otherPlayer = moduleToExports.getOtherPlayerById(player.id);
        if (otherPlayer) {

            // calculate distance between the two players
            var x = returnValue.newX - otherPlayer.position.x;
            var y = returnValue.newY - otherPlayer.position.y;
            var distanceBetweenCenters =  Math.sqrt(
                Math.pow(x, 2)
                + Math.pow(y, 2)
            );

            // if there is a collision
            if (distanceBetweenCenters < 2 * BALL_RADIUS) {
                returnValue.newX = otherPlayer.position.x + (x * 2 * BALL_RADIUS / distanceBetweenCenters);
                returnValue.newY = otherPlayer.position.y + (y * 2 * BALL_RADIUS / distanceBetweenCenters);

                sockets.collision([player.id, otherPlayer.id]);

                var player1Speed = moduleToExports.getPlayerSpeedFromPlayer(player);
                var player2Speed = moduleToExports.getPlayerSpeedFromPlayer(otherPlayer);

                if (
                    player1Speed > player2Speed
                    && otherPlayer.spellEffect != SPELLS.IMMUNITY
                    && Date.now() - otherPlayer.lastImpact > 500
                ) {
                    otherPlayer.lastImpact = Date.now();
                    var deltaX = previousX - otherPlayer.position.x;
                    var deltaY = previousY - otherPlayer.position.y;
                    _recurseImpact(
                        otherPlayer,
                        deltaX > 0 ? deltaX - BALL_RADIUS : deltaX + BALL_RADIUS,
                        deltaY > 0 ? deltaY - BALL_RADIUS : deltaY + BALL_RADIUS,
                        0
                    );
                } else if (player1Speed < player2Speed) {
                    //for (var index in players) {
                        if (
                            player.spellEffect != SPELLS.IMMUNITY
                            && Date.now() - player.lastImpact > 500
                        ) {
                            player.lastImpact = Date.now();
                            var deltaX = -(previousX - player.position.x);
                            var deltaY = -(previousY - player.position.y);
                            _recurseImpact(
                                player,
                                deltaX > 0 ? deltaX - BALL_RADIUS : deltaX + BALL_RADIUS,
                                deltaY > 0 ? deltaY - BALL_RADIUS : deltaY + BALL_RADIUS,
                                0
                            );
                            //break;
                        }
                    //}
                }
            }
        }
    }
    return returnValue;
}

var moduleToExports = {

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

    getOtherPlayerById: function (id) {
        for (var i in players) {
            if (players[i].id != id) {
                return players[i];
            }
        }
        return null;
    },

    registerPlayer: function (id, name, spellType) {
        if (players.length < 2) {
            var initPosition = {
                x: players.length == 1 ? GAME_HORIZONTAL - BALL_RADIUS : BALL_RADIUS,
                y: players.length == 1 ? GAME_VERTICAL - BALL_RADIUS : BALL_RADIUS
            };
            var player = {
                id: id,
                score: 0,
                name: name,
                power: 0,
                position: initPosition,
                lastImpact: Date.now(),
                history: [initPosition,initPosition],
                spell: spellType
            };
            players.push(player);
            if (players.length == 2) this.launchGame();
            return player;
        }
        return false;
    },

    deletePlayer: function (id) {
        for (var i in players) {
            if (players[i].id == id) {
                players.splice(i, 1);
                if (players.length == 1) {
                    this.interruptGame();
                    var stayedPlayer = JSON.parse(JSON.stringify(players[0]));
                    players = [];
                    this.registerPlayer(stayedPlayer.id, stayedPlayer.name, stayedPlayer.spell)
                }
                return true;
            }
        }
        return false;
    },

    incrScore: function (playerId) {
        var player = this.getPlayerById(playerId);
        if (player) {
            player.score++;
            return true;
        }
        return false;
    },

    incrPower: function (playerId) {
        var player = this.getPlayerById(playerId);
        if (player) {
            player.power++;
            return true;
        }
        return false;
    },

    getPlayerSpeed: function (playerId) {
        var player = this.getPlayerById(playerId);
        if (player) {
            return Math.sqrt(
                Math.pow(player.history[0].x - player.history[1].x, 2)
                + Math.pow(player.history[0].y - player.history[1].y, 2)
            ) / 60;
        }
        return null;
    },

    getPlayerSpeedFromPlayer: function (player) {
        return Math.sqrt(
            Math.pow(player.history[0].x - player.history[1].x, 2)
            + Math.pow(player.history[0].y - player.history[1].y, 2)
        ) / 60;
    },

    movePlayer: function (playerId, deltaX, deltaY) {

        var player = this.getPlayerById(playerId);
        if (player) {
            // SPELL EFFECT
            if (player.spellEffect == SPELLS.CONTROL_REVERSAL) {
                deltaX = - deltaX;
                deltaY = - deltaY;
            } else if (player.spellEffect == SPELLS.SLOW_DOWN) {
                deltaX /= 5;
                deltaY /= 5;
            }

            // CHECK MAX BOUND
            if (deltaX > BALL_RADIUS) { deltaX = BALL_RADIUS - 1; }
            if (deltaY > BALL_RADIUS) { deltaY = BALL_RADIUS - 1; }
            if (deltaX < - BALL_RADIUS) { deltaX = - BALL_RADIUS + 1; }
            if (deltaY < - BALL_RADIUS) { deltaY = - BALL_RADIUS + 1; }

            // FIND NEW POSITION
            var newPosition = _findNewPosition(
                player,
                player.position.x + parseInt(deltaX),
                player.position.y + parseInt(deltaY),
                player.position.x,
                player.position.y
            );

            // AFFECT POSITION
            player.position.x = newPosition.newX;
            player.position.y = newPosition.newY;
            return player;
        }

        return false;
    },

    castSpell: function (playerId) {
        var player = this.getPlayerById(playerId);
        var otherPlayer = this.getOtherPlayerById(playerId);
        var now = Date.now();
        if (player && player.power >= 10 && (now - (player.lastCast ? player.lastCast : 0) > 3000) ) {
            player.power -= 10;
            player.lastCast = now;
            if (player.spell == SPELLS.CONTROL_REVERSAL && otherPlayer) {
                sockets.cast(playerId, SPELLS.CONTROL_REVERSAL);
                spells.castSpell(player.spell, otherPlayer);
            } else if (player.spell == SPELLS.SLOW_DOWN && otherPlayer) {
                sockets.cast(playerId, SPELLS.SLOW_DOWN);
                spells.castSpell(player.spell, otherPlayer);
            } else if (player.spell == SPELLS.HEAL) {
                // TODO HERE : add life to player
                sockets.cast(playerId, SPELLS.HEAL);
                spells.castSpell(player.spell, player);
            } else if (player.spell == SPELLS.IMMUNITY) {
                sockets.cast(playerId, SPELLS.IMMUNITY);
                spells.castSpell(player.spell, player);
            }
            return true;
        }
        return false;
    },

    memorizeHistory: function () {
        setInterval(function () {
            for (var i in players) {
                players[i].history = [players[i].history[1], {
                    x: players[i].position.x,
                    y: players[i].position.y
                }];
            }
        }, 60);
    },

    launchGame: function () {
        sockets.start();
        timeout = setTimeout(function () {
            sockets.end(players);
            players = [];
            sockets.emitChanges();
        }, GAME_DURATION);
    },

    interruptGame: function () {
        clearTimeout(timeout);
        sockets.break();
    }

};
module.exports = moduleToExports;

function _recurseImpact(player, deltaX, deltaY, index) {
    if (player) {
        player.position.x -= deltaX;
        player.position.y -= deltaY;
        if (player.position.x < BALL_RADIUS) {
            player.position.x = BALL_RADIUS;
            deltaX = -deltaX;
            if (player.spellEffect != SPELLS.IMMUNITY) sockets.collision([player.id]);
        }
        if (player.position.y < BALL_RADIUS) {
            player.position.y = BALL_RADIUS;
            deltaY = -deltaY;
            if (player.spellEffect != SPELLS.IMMUNITY) sockets.collision([player.id]);
        }
        if (player.position.x > GAME_HORIZONTAL - BALL_RADIUS) {
            player.position.x = GAME_HORIZONTAL - BALL_RADIUS;
            deltaX = -deltaX;
            if (player.spellEffect != SPELLS.IMMUNITY) sockets.collision([player.id]);
        }
        if (player.position.y > GAME_VERTICAL - BALL_RADIUS) {
            player.position.y = GAME_VERTICAL - BALL_RADIUS;
            deltaY = -deltaY;
            if (player.spellEffect != SPELLS.IMMUNITY) sockets.collision([player.id]);
        }
        sockets.emitChanges();
        if (index < 100 && (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1)) {
            setTimeout(function () {
                _recurseImpact(player, deltaX / 1.3, deltaY / 1.3, index + 1);
            }, 60);
        }
    }
}