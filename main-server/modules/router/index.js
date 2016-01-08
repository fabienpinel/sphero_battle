var callbacks = require('../callbacks');

module.exports = function (router) {

    router.get('/hello-world', function (req, res) {
        callbacks.helloWorld(req, res);
    });


    return router;

};