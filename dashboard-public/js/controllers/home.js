app.controller('homeCtrl', ['$scope','playersFactory','spherosFactory', function ($scope,playersFactory,spherosFactory) {

    var vm = this;

    vm.players = playersFactory.getPlayers;
    vm.spheros = spherosFactory.getSpheros;

    vm.up = function(index) {
        playersFactory.upPower(index);
        console.log(playersFactory.upPower);
    }


}]);