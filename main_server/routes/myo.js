/**
 * Created by jeremy on 18/12/15.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/register/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/move/', function(req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
