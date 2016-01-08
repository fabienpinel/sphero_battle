var callbacks = require('../callbacks');
var playerFactory = require('../players');
var spherosFactory = require('../spheros');

var io = null;

module.exports = {


    emitChanges: function () {
        if (io)
            io.sockets.emit('dataChange', {
                players: playerFactory.getPlayers(),
                spheros: spherosFactory.getSpheros()
            });
    },

    socketCallback: function (yoy) {

        io = yoy;

        return function (socket) {

            socket.emit('dataChange', {
                players: playerFactory.getPlayers(),
                spheros: spherosFactory.getSpheros()
            });

        }

    }
}


