(function() {
    'use strict';

    app.factory('playersFactory', playersFactory)
        .factory('spherosFactory', spherosFactory);


    function playersFactory() {
        return {
            getPlayers : [
                {name : "pd", score: 0, power: 32},
                {name : "sodom", score: 5, power:42}
            ],
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
})();