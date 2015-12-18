var sphero = require("sphero");

module.exports = function (spheroId, cb) {
    var orb = sphero('/dev/tty.Sphero-' + spheroId + '-AMP-SPP'); // change port accordingly
    orb.connect(function() {
        cb(orb);
    });
};