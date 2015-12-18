var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var spheroConnect = require('./modules/connect');

if (process.argv.length == 4) {
    var app = express();
    app.use(bodyParser.json());
    app.use(cors());

    spheroConnect(process.argv[2], function (orb) {

        orb.color("green");
        orb.detectCollisions();
        orb.on("collision", function () {
            console.log('collision');
            orb.color("red");
            setTimeout(function () {
                orb.color("green");
            }, 1000);
        });

        var router = require('./modules/router')(express.Router(), orb);
        app.use('/',router);
        console.log("Server Launched on port 8080...");
        app.listen(8080);
    });
} else {
    console.error('You must specify the id of the Sphero and the url of the global server\nnode index.js [sphero_id] [server_url]');
}

