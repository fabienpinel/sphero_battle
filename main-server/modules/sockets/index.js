var callbacks = require('../callbacks');
var playerFactory = require('../players');
var spherosFactory = require('../spheros');
var sockets = [];

module.exports = {

    emitChanges: function () {
          for (var i in sockets) {
              sockets[i].emit('dataChange', {
                  players: playerFactory.getPlayers(),
                  spheros: spherosFactory.getSpheros()
              });
          }
    },

    socketCallback: function (socket) {

        sockets.push(socket);

    }
};


