var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
app.use(bodyParser.json());
app.use(cors());

var router = require('./modules/router')(express.Router());
var sphero = require('./modules/sphero/')(express.Router());
var myo = require('./modules/myo/')(express.Router());

app.use('/',router);
app.use('/sphero', sphero);
app.use('/myo', myo);
console.log("Server Launched on port 3000...");
app.listen(3000);
