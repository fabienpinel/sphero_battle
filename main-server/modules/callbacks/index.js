var spheroFactory = require('../spheros');
var playerFactory = require('../players');
var uniqid = require('uniqid');
var request = require('request');
var sockets = require('../sockets');

module.exports = {
    getSpheros: function (req, res) {
        res.status(200).json(spheroFactory.getSpheros());
    },

    getPlayers: function (req, res) {
        res.status(200).json(playerFactory.getPlayers());
    },

    associateSpheroToPlayer: function (req, res) {
        var playerId = uniqid();
        var sphero = spheroFactory.associatePlayer(playerId);
        if (sphero) {
            var player = playerFactory.registerPlayer(playerId);
            if (player) {
                sockets.emitChanges();
                res.status(201).end();
            } else {
                res.status(409).end();
            }
        } else {
            res.status(409).end();
        }
    },

    deletePlayer: function (req, res) {
        var isSpheroDeleted = spheroFactory.deletePlayer(req.params.id);
        var isPlayerDeleted = playerFactory.deletePlayer(req.params.id);
        if (isSpheroDeleted && isPlayerDeleted) {
            sockets.emitChanges();
            res.status(204).end()
        } else {
            res.status(404).end()
        }
    },

    collision: function (req ,res) {
        console.log('collision of', req.params.id);
        var sphero = spheroFactory.getSpheroById(req.params.id);
        if (sphero) {
            var player = playerFactory.incrScore(sphero.player);
            if (player) {
                sockets.emitChanges();
                res.status(201).end();
            } else {
                res.status(404).end();
            }
        } else {
            res.status(404).end();
        }
    },

    changeSpheroColor: function (req, res) {
        var sphero = spheroFactory.getSpheroById(req.params.id);
        if (sphero) {
            // TODO
            res.status(201).end();
        } else {
            res.status(404).end();
        }
    },

    moveSphero: function (req, res) {
        var sphero = spheroFactory.getSpheroById(req.params.id);
        if (sphero) {
            sockets.sendCommand(req.params.id, req.params.x, req.params.y);
            res.status(201).end();
        } else {
            res.status(404).end();
        }
    },

    voteForPlayer: function (req, res) {
        var player = playerFactory.incrPower(req.params.id);
        if (player) {
            sockets.emitChanges();
            res.status(201).end();
        } else {
            res.status(404).end();
        }
    },

    movePlayer: function (req, res) {
        var hasMoved = playerFactory.movePlayer(req.params.id, req.params.deltaX, req.params.deltaY);
        if (hasMoved) {
            sockets.emitChanges();
            res.status(201).end();
        } else {
            res.status(404).end();
        }
    }

};