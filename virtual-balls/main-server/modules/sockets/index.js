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
        var players = require('../players').getPlayers();
        for (var i in players) {
            if (players[i].id != playerId) {
                players[i].score++;
            }
        }
        this.emitChanges();

    },

    emitChanges: function () {
        var playerFactory = require('../players');
        if (io)
            io.sockets.emit('dataChange', {
                players: playerFactory.getPlayers()
            });
    },

    socketCallback: function (yoy) {

        io = yoy;

        return function (socket) {

            var playerFactory = require('../players');
            socket.emit('dataChange', {
                players: playerFactory.getPlayers()
            });

        }

    }
};


