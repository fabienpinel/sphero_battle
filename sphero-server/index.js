var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var spheroConnect = require('./modules/connect');
var request = require('request');

var server = null;

if (process.argv.length == 6) {

    buildSphero();

} else {
    console.error(
        'You must specify the id of the Sphero and the url of the global server\n' +
        'node index.js [sphero_id] [server_url] [your_ip] [your_port]'
    );
}

function buildSphero() {
    function _buildSphero() {
        var app = express();
        app.use(bodyParser.json());
        app.use(cors());

        spheroConnect(process.argv[2], function (orb) {

            request.post({
                url: process.argv[3] + '/spheros',
                body: {
                    id: process.argv[2],
                    url: 'http://' + process.argv[4] + ':' + process.argv[5]
                },
                json: true
            });

            orb.color("green");
            orb.detectCollisions();
            orb.on("collision", function () {
                // call main server
                request.post(process.argv[3] + '/spheros/' + process.argv[2] + '/collision');

                console.log('collision');
                orb.color("red");
                orb.stop();
                setTimeout(function () {
                    orb.color("green");
                }, 1000);
            });

            var router = require('./modules/router')(express.Router(), orb);
            app.use('/',router);
            console.log("Server Launched on port " + process.argv[5] + " ...");
            server = app.listen(process.argv[5], function () {
                recursivePing(orb);
            });

        });
    }
    if (server) {
        server.close(function () {
            server = null;
            _buildSphero();
        });
    } else {
        _buildSphero();
    }
}

function recursivePing(orb) {
    setTimeout(function () {
        orb.ping(function (err) {
            if (err) {
                console.log('disconnect : try to reconnect');
                //request.del(process.argv[3] + '/spheros/' + process.argv[2]);
            } else {
                recursivePing(orb);
            }
        });
    }, 1000);
}