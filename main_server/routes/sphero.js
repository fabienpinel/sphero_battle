/**
 * Created by jeremy on 18/12/15.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/collision/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/register/', function(req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
