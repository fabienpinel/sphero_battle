/**
 * Created by jeremy on 18/12/15.
 */
var callbacks = require('../callbacks');

module.exports = function (router) {

    router.post('/collision/', function (req, res) {
        callbacks.collision(req, res);
    });

    router.post('/register/', function (req, res) {
        callbacks.registerSphero(req, res);
    });

    return router;

};