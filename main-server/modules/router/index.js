var callbacks = require('../callbacks');

module.exports = function (router) {

    router.get('/', function (req, res) {
        callbacks.helloWorld(req, res);
    });

    return router;

};