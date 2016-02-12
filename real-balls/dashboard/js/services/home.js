(function() {
    'use strict';

    app.factory('socket', socket);

    function socket(socketFactory) {
        return socketFactory({
            prefix: 'dp~',
            ioSocket: io.connect('http://192.168.43.128:3000/')
        });
    }
})();