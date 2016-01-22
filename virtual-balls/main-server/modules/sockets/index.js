var io = null;

module.exports = {


    collision: function (playerId) {
        if (io)
            io.sockets.emit('collision', playerId);
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
}


