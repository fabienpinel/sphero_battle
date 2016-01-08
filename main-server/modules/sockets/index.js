var callbacks = require('../callbacks');
var playerFactory = require('../players');
var spherosFactory = require('../spheros');

module.exports = function (io) {

    return {
        emitChanges: function () {
            io.sockets.emit('dataChange', {
                players: playerFactory.getPlayers(),
                spheros: spherosFactory.getSpheros()
            });
        },

        socketCallback: function (socket) {

            socket.emit('dataChange', {
                players: playerFactory.getPlayers(),
                spheros: spherosFactory.getSpheros()
            });

        }
    };

};


