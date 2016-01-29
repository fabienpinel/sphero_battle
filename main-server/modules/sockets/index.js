var playerFactory = require('../players');
var spherosFactory = require('../spheros');

var sockets = [];

var io = null;

var moduleToExports = {

    sendCommand: function(spheroId, x, y) {
        console.log("trying to emit towards "+spheroId+" ,x: "+x+" ,y: "+y);
        for (var i in sockets) {
            if (sockets[i].id == spheroId) {
                console.log("seding to socket connection"+spheroId+" ,x: "+x+" ,y: "+y);
                sockets[i].emit('command', x, y);
            }
        }
    },

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

            var spheroId = null;

            socket.emit('dataChange', {
                players: playerFactory.getPlayers(),
                spheros: spherosFactory.getSpheros()
            });

            socket.on('spheroId', function (id) {
                var result = spherosFactory.addSphero(id);
                if (result) {
                    socket.id = id;
                    sockets.push(socket);
                    moduleToExports.emitChanges();
                }
            });

            socket.on('collision', function () {
                io.sockets.emit('collision', spherosFactory.getSpheroById(spheroId));
            });

            socket.on('disconnect', function () {
                if (spheroId) {
                    spherosFactory.deleteSpheroById(spheroId);
                }
            })
        }

    }
};

module.exports = moduleToExports;