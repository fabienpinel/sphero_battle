var callbacks = require('../callbacks');

module.exports = function (socket, orb) {

    socket.on('move', function (angle, direction) {
        console.log('move', angle, direction);
        if (angle == 0 && direction == 0) {
            orb.stop();
        } else {
            orb.roll(parseInt(direction) / 5, parseInt(angle) % 360);
        }
    });

};