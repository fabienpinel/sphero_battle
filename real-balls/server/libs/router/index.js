var express = require('express');
var router = express.Router();
var api = require('../api');

router
    .post('/players', api.post)
    .post('/players/:id/collision', api.postCollision)
    .post('/players/:id/power', api.postPower)
    .post('/players/:id/cast', api.postCastSpell)
    .delete('/players/:id', api.deletePlayer);

module.exports = router;