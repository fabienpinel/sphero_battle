app.controller('homeCtrl', ['$scope','playersFactory','spherosFactory', 'socket', function ($scope,playersFactory,spherosFactory,socket) {

    var vm = this;

    vm.players = [];
    vm.spheros = spherosFactory.getSpheros;

    socket.on('dataChange', function (data) {
        vm.spheros = data.spheros;
        vm.players = data.players;
    });

    vm.up = function(index) {
        playersFactory.upPower(index);
        console.log(playersFactory.upPower);
    }

}]);