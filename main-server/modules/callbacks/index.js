var spheroFactory = require('../spheros')();
var uniqid = require('uniqid');
var request = require('request');

module.exports = {
    getSpheros: function (req, res) {
        res.status(200).json(spheroFactory.getSpheros());
    },

    registerSphero: function (req, res) {
        var result = spheroFactory.addSphero({
            id: req.body.id,
            url: req.body.url
        });
        result ?
            res.status(201).end():
            res.status(400).end();
    },

    associateSpheroToPlayer: function (req, res) {
        var playerId = uniqid();
        var sphero = spheroFactory.associatePlayer(playerId);
        sphero ?
            res.status(201).json(sphero):
            res.status(409).end();
    },

    deletePlayer: function (req, res) {
        var isDeleted = spheroFactory.deletePlayer(req.params.id);
        isDeleted ?
            res.status(204).end():
            res.status(404).end();
    },

    deleteSphero: function (req ,res) {
        var isDeleted = spheroFactory.deleteSpheroById(req.params.id);
        isDeleted ?
            res.status(204).end():
            res.status(404).end();
    },

    collision: function (req ,res) {
        console.log('collision of', req.params.id);
        res.status(200).end();
    },

    changeSpheroColor: function (req, res) {
        var sphero = spheroFactory.getSpheroById(req.params.id);
        if (sphero) {
            request.post(sphero.url + '/color/' + req.params.color, function (error, response, body) {
                if (!error && response.statusCode == 201) {
                    res.status(201).end();
                } else {
                    res.status(response.statusCode).json(error);
                }
            });
        } else {
            res.status(404).end();
        }
    },

    moveSphero: function (req, res) {
        var sphero = spheroFactory.getSpheroById(req.params.id);
        if (sphero) {
            request.post(sphero.url + '/move/' + req.params.angle + '/' + req.params.distance, function (error, response, body) {
                console.log(error, body);
                res.status(201).end();
            });
        } else {
            res.status(404).end();
        }
    }

};