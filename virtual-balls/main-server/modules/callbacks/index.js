var playerFactory = require('../players');
var uniqid = require('uniqid');
var sockets = require('../sockets');

module.exports = {

    getPlayers: function (req, res) {
        res.status(200).json(playerFactory.getPlayers());
    },

    registerPlayer: function (req, res) {
        var playerId = uniqid();
        var player = playerFactory.registerPlayer(playerId, req.body.name, req.body.spell);
        if (player) {
            sockets.emitChanges();
            res.status(201).json(player);
        } else {
            res.status(409).end();
        }
    },

    deletePlayer: function (req, res) {
        var isPlayerDeleted = playerFactory.deletePlayer(req.params.id);
        if (isPlayerDeleted) {
            sockets.emitChanges();
            res.status(204).end()
        } else {
            res.status(404).end()
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
    },

    castSpell: function (req, res) {
        var hasSpelled = playerFactory.castSpell(req.params.id);
        if (hasSpelled) {
            res.status(201).end();
        } else {
            res.status(404).end();
        }
    }

};