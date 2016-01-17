/*var sphero = require("sphero");

module.exports = function (spheroId, cb) {
    var orb = sphero('/dev/tty.Sphero-' + spheroId + '-AMP-SPP'); // change port accordingly
    orb.connect(function() {
        cb(orb);
    });
};

*/

var Cylon = require('cylon');

module.exports = function (spheroId, cb) {
    Cylon.api('http', {
        ssl: false // serve unsecured, over HTTP
    });
    Cylon.robot({
        connections: {
            sphero: { adaptor: 'sphero', port: '/dev/tty.Sphero-' + spheroId + '-AMP-SPP' },
            loopback: { adaptor: 'loopback' }
        },

        devices: {
            sphero: { driver: 'sphero' },
            ping: {driver: 'ping'}
        },

        work: function(my) {
            cb(my.sphero);
        }
    }).start();
};
