var callbacks = require('../callbacks');

module.exports = function (router, orb) {

    router.get('/hello-world', function (req, res) {
        callbacks.helloWorld(req, res, orb);
    });

    router.post('/color/:color', function (req, res) {
        callbacks.changeColor(req, res, orb);
    });

    router.post('/move/:angle/:distance', function (req, res) {
       callbacks.move(req, res, orb);
    });

    return router;

};