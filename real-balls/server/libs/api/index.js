var uniqid = require('uniqid');
var sockets = require('../sockets');

var players = [];
var SPELL_DURATION = 3000;
var GAME_DURATION = 2 * 60 * 1000;
var SPELLS = require('../config').SPELLS;
var timeout = null;

function _castSpell(spellType, toPlayer) {
    if (!toPlayer.spellEffect) {
        toPlayer.spellEffect = spellType;
        sockets.emitChanges();
        setTimeout(function () {
            delete toPlayer.spellEffect;
            sockets.emitChanges();
        }, SPELL_DURATION);
    }
}

function _breakGame() {
    sockets.break();
    clearTimeout(timeout);
}

function _launchGame() {
    sockets.start();
    timeout = setTimeout(function () {
        _endGame();
    }, GAME_DURATION);
}

function _endGame() {
    sockets.end(players);
    players = [];
    clearTimeout(timeout);
}

module.exports = {

    _getPlayers: function () { return players; },

    post: function (req, res) {
        if (players.length < 2) {
            var player = {
                id: uniqid(),
                life: 100,
                name: 'Player ' + (players.length === 0 ? '1' : '2') ,
                power: 0,
                spell: SPELLS.SLOW_DOWN,
                voteForSlowDown: [],
                voteForControlReversal: [],
                voteForHeal: [],
                voteForImmunity: []
            };
            players.push(player);
            sockets.emitChanges();
            if (players.length == 2) {
                _launchGame();
            }
            return res.status(201).json(player);
        }
        return res.status(409).json(new Error('Server is full'));
    },

    postCollision: function (req, res) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == req.params.id) {
                players[i].life--;
                if (players[i].life == 0) {
                    _endGame();
                    sockets.collision(players[i].id);
                } else {
                    sockets.collision(players[i].id);
                    sockets.emitChanges();
                }
                return res.status(201).end();
            }
        }
        return res.status(404).json(new Error('no such player'));
    },

    postPower: function (req, res) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == req.params.id) {
                if (players[i].power < 100) players[i].power++;
                sockets.emitChanges();
                return res.status(201).end();
            }
        }
        return res.status(404).json(new Error('no such player'));
    },

    deletePlayer: function (req, res) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == req.params.id) {
                players.splice(i, 1);
                if (players.length == 1) _breakGame();
                sockets.emitChanges();
                return res.status(204).end();
            }
        }
        return res.status(404).json(new Error('no such player'));
    },

    postCastSpell: function (req, res) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == req.params.id) {
                var player = players[i];
                var now = Date.now();
                if (player.power >= 20 && (now - (player.lastCast ? player.lastCast : 0) > SPELL_DURATION)) {
                    player.power -= 20;
                    player.lastCast = now;
                    if (player.spell == SPELLS.CONTROL_REVERSAL) {
                        sockets.cast(player.id, SPELLS.CONTROL_REVERSAL);
                        _castSpell(player.spell, i == 0 ? players[1] : players[0]);
                    } else if (player.spell == SPELLS.SLOW_DOWN) {
                        sockets.cast(player.id, SPELLS.SLOW_DOWN);
                        _castSpell(player.spell, i == 0 ? players[1] : players[0]);
                    } else if (player.spell == SPELLS.HEAL) {
                        player.life += 5;
                        player.life = player.life > 100 ? 100 : player.life;
                        sockets.cast(player.id, SPELLS.HEAL);
                        _castSpell(player.spell, player);
                    } else if (player.spell == SPELLS.IMMUNITY) {
                        sockets.cast(player.id, SPELLS.IMMUNITY);
                        _castSpell(player.spell, player);
                    }
                    return res.status(201).end();
                } else {
                    return res.status(409).end();
                }

            }
        }
        return res.status(404).json(new Error('no such player'));
    }

};