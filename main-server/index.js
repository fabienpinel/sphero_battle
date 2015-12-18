var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
app.use(bodyParser.json());
app.use(cors());

var router = require('./modules/router')(express.Router());
app.use('/',router);
console.log("Server Launched on port 3000...");
app.listen(3000);
