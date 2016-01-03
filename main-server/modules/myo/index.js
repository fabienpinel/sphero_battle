var callbacks = require('../callbacks');

module.exports = function (router) {

    router.get('/register/', function (req, res) {
        callbacks.registerMyo(req, res);
    });

    router.post('/move/', function (req, res) {
        callbacks.moveSphero(req, res);
    });

    return router;
};