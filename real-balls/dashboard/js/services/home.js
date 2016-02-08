(function() {
    'use strict';

    app.factory('socket', socket);

    function socket(socketFactory) {
        return socketFactory({
            prefix: 'dp~',
            ioSocket: io.connect('http://localhost:3000/')
        });
    }
})();