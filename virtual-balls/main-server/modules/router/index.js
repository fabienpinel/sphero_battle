var callbacks = require('../callbacks');

module.exports = function (router) {

    // create a new player
    router.post('/api/players', callbacks.registerPlayer);

    // delete a player
    router.delete('/api/players/:id', callbacks.deletePlayer);

    // move a player
    router.post('/api/players/:id/deltaX/:deltaX/deltaY/:deltaY', callbacks.movePlayer);

    // vote for a player
    router.post('/api/players/:id/power', callbacks.voteForPlayer);

    return router;
};