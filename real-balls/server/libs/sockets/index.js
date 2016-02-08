var uniqid = require('uniqid');
var SPELLS = require('../config').SPELLS;
var request = require('request');
var io = null;

module.exports = {

    start: function () {
        if (io) io.sockets.emit('start');
    },

    end: function (results) {
        if (io) io.sockets.emit('end', results);
    },

    'break': function () {
        if (io) io.sockets.emit('break');
    },

    cast: function (playerId, spellType) {
        if (io)
            io.sockets.emit('cast', {
                playerId: playerId,
                spellType: spellType
            });
    },

    collision: function (playerId) {
        if (io)
            io.sockets.emit('collision', playerId);
    },

    emitChanges: function () {
        var api = require('../api');
        if (io)
            io.sockets.emit('dataChange', {
                players: api._getPlayers()
            });
    },

    socketCallback: function (yoy) {

        var self = this;
        io = yoy;

        return function (socket) {

            var api = require('../api');
            socket.emit('dataChange', {
                players: api._getPlayers()
            });

            /**
             * Voter section
             */
            var voterId = uniqid();
            socket.on('voteForPower', function (data) {

                var playerId = data.playerId;
                var spellType = data.spellType;

                var players = api._getPlayers();
                for (var i = 0; i < players.length; i++) {
                    if (players[i].id == playerId) {
                        // delete if exists
                        var controlReversalIndex = players[i].voteForControlReversal.indexOf(voterId);
                        if (controlReversalIndex) players[i].voteForControlReversal.splice(controlReversalIndex, 1);
                        var slowDownIndex = players[i].voteForSlowDown.indexOf(voterId);
                        if (slowDownIndex) players[i].voteForSlowDown.splice(slowDownIndex, 1);
                        var immunityIndex = players[i].voteForImmunity.indexOf(voterId);
                        if (immunityIndex) players[i].voteForImmunity.splice(immunityIndex, 1);
                        var healIndex = players[i].voteForHeal.indexOf(voterId);
                        if (healIndex) players[i].voteForHeal.splice(healIndex, 1);

                        // add it
                        if (spellType == SPELLS.CONTROL_REVERSAL) {
                            players[i].voteForControlReversal.push(voterId);
                        } else if (spellType == SPELLS.SLOW_DOWN) {
                            players[i].voteForSlowDown.push(voterId);
                        } else if (spellType == SPELLS.IMMUNITY) {
                            players[i].voteForImmunity.push(voterId);
                        } else if (spellType == SPELLS.HEAL) {
                            players[i].voteForHeal.push(voterId);
                        }

                        // who is the best ?
                        if (
                            players[i].voteForControlReversal.length > players[i].voteForSlowDown.length
                            && players[i].voteForControlReversal.length > players[i].voteForImmunity.length
                            && players[i].voteForControlReversal.length > players[i].voteForHeal.length
                        ) { players[i].spellType = SPELLS.CONTROL_REVERSAL; }
                        else if (
                            players[i].voteForSlowDown.length > players[i].voteForControlReversal.length
                            && players[i].voteForSlowDown.length > players[i].voteForImmunity.length
                            && players[i].voteForSlowDown.length > players[i].voteForHeal.length
                        ) { players[i].spellType = SPELLS.SLOW_DOWN; }
                        else if (
                            players[i].voteForImmunity.length > players[i].voteForControlReversal.length
                            && players[i].voteForImmunity.length > players[i].voteForSlowDown.length
                            && players[i].voteForImmunity.length > players[i].voteForHeal.length
                        ) { players[i].spellType = SPELLS.IMMUNITY; }
                        else if (
                            players[i].voteForHeal.length > players[i].voteForControlReversal.length
                            && players[i].voteForHeal.length > players[i].voteForSlowDown.length
                            && players[i].voteForHeal.length > players[i].voteForImmunity.length
                        ) { players[i].spellType = SPELLS.HEAL; }

                        // emit change
                        self.emitChanges();
                    }
                }
            });
            socket.on('disconnect', function () {
                var players = api._getPlayers();
                for (var i = 0; i < players.length; i++) {
                    // delete if exists
                    var controlReversalIndex = players[i].voteForControlReversal.indexOf(voterId);
                    if (controlReversalIndex) players[i].voteForControlReversal.splice(controlReversalIndex, 1);
                    var slowDownIndex = players[i].voteForSlowDown.indexOf(voterId);
                    if (slowDownIndex) players[i].voteForSlowDown.splice(slowDownIndex, 1);
                    var immunityIndex = players[i].voteForImmunity.indexOf(voterId);
                    if (immunityIndex) players[i].voteForImmunity.splice(immunityIndex, 1);
                    var healIndex = players[i].voteForHeal.indexOf(voterId);
                    if (healIndex) players[i].voteForHeal.splice(healIndex, 1);

                    // emit change
                    self.emitChanges();
                }
                if (player) {
                    request.del('http://localhost:3000/api/players/' + player.id, function () {
                        player = null;
                    });
                }
            });

            /**
             * Player section
             */
            var player = null;
            socket.on('player:register', function () {
                if (!player) {
                    request.post('http://localhost:3000/api/players', function (error, response, body) {
                        if (error) return socket.emit('player:register', {status: 'error', error: error});
                        if (response.statusCode === 201) {
                            player = JSON.parse(body);
                            socket.emit('player:register', {status: 'success', player: body});
                        } else {
                            return socket.emit('player:register', {status: 'error', statusCode:response.statusCode, error:body});
                        }
                    });
                }
            });
            socket.on('player:collision', function () {
                if (player) {
                    request.post('http://localhost:3000/api/players/' + player.id + '/collision', function (error, response, body) {
                        if (error) return socket.emit('player:collision', {status: 'error', error: error});
                        if (response.statusCode === 201) {
                            socket.emit('player:collision', {status: 'success'});
                        } else {
                            return socket.emit('player:collision', {status: 'error', statusCode:response.statusCode, error:body});
                        }
                    });
                }
            });
            socket.on('player:cast', function () {
                if (player) {
                    request.post('http://localhost:3000/api/players/' + player.id + '/cast', function (error, response, body) {
                        if (error) return socket.emit('player:cast', {status: 'error', error: error});
                        if (response.statusCode === 201) {
                            socket.emit('player:cast', {status: 'success'});
                        } else {
                            return socket.emit('player:cast', {status: 'error', statusCode:response.statusCode, error:body});
                        }
                    });
                }
            });
            socket.on('player:delete', function () {
                if (player) {
                    request.del('http://localhost:3000/api/players/' + player.id, function () {
                        player = null;
                    });
                }
            });

        }
    }
};


