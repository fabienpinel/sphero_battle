var callbacks = require('../callbacks');

module.exports = function (router) {

    router.get('/spheros', callbacks.getSpheros);
    router.post('/spheros', callbacks.registerSphero);
    router.delete('/spheros/:id', callbacks.deleteSphero);

    router.post('/players', callbacks.associateSpheroToPlayer);
    router.delete('/players/:id', callbacks.deletePlayer);
    router.post('/players/:id/power', callbacks.voteForPlayer);

    router.post('/spheros/:id/color/:color', callbacks.changeSpheroColor);
    router.post('/spheros/:id/move/:angle/:distance', callbacks.moveSphero);
    router.post('/spheros/:id/collision', callbacks.collision);


    return router;
};