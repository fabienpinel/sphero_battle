var playerFactory = require('../players');

var io = null;

module.exports = {


    emitChanges: function () {
        if (io)
            io.sockets.emit('dataChange', {
                players: playerFactory.getPlayers()
            });
    },

    socketCallback: function (yoy) {

        io = yoy;

        return function (socket) {

            socket.emit('dataChange', {
                players: playerFactory.getPlayers()
            });

        }

    }
}


