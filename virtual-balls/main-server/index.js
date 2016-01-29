var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
app.use(bodyParser.json());
app.use(cors());

// LAUNCH SERVER PART
var router = require('./modules/router')(express.Router());
app.use('/',router);
var server = app.listen(3000, function () {
    console.log("Server Launched on port 3000...");
    var players = require('./modules/players');
    players.memorizeHistory();
});

// SOCKET PART
var io = require('socket.io').listen(server);
var sockets = require('./modules/sockets');
io.on('connection', sockets.socketCallback(io));