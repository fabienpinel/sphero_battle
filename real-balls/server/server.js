function buildServer(cb) {
    var express = require('express');
    var bodyParser = require('body-parser');
    var cors = require('cors');

    var app = express();
    app.use(bodyParser.json());
    app.use(cors());

    var router = require('./libs/router');

    app.use('/api',router);

    console.log("Server Launched on port 3000...");
    var server = app.listen(3000, function () {
        if (cb) cb(server);
    });

    var io = require('socket.io').listen(server);
    var sockets = require('./libs/sockets');

    io.on('connection', sockets.socketCallback(io));

    return server;
}

module.exports = buildServer;