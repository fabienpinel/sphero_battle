(function() {
    'use strict';

    app.factory('playersFactory', playersFactory)
        .factory('spherosFactory', spherosFactory)
        .factory('socket', socket);


    function playersFactory() {
        return {
            getPlayers: function () {
                return [{
                    id: 'joueur inconnu',
                    score: 0,
                    power: 0
                }, {
                    id: 'joueur inconnu',
                    score: 0,
                    power: 0
                }];
            },
            setPlayers: function (index,newValue) {
                this.getPlayers[index] = newValue;
            },
            upPower: function(index) {
                this.getPlayers[index].power++;
            }
        }
    }

    function spherosFactory() {
        return {
            getSpheros : [
                {color : "red"},
                {color : "blue"}
            ],
            setSpheros: function (index,newValue) {
                this.getSpheros[i] = newValue;
            }
        }
    }

    function socket(socketFactory) {
        return socketFactory({
            prefix: 'dp~',
            ioSocket: io.connect('http://localhost:3000/')
        });
    }
})();