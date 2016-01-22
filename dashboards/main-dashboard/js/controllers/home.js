app.controller('homeCtrl', ['$scope','playersFactory','spherosFactory', 'socket', function ($scope,playersFactory,spherosFactory,socket) {

    var vm = this;
    vm.init = true;
    vm.collision1 = vm.collision2 = false;

    $timeout(function(){
        vm.init = false;
    }, 2000);

    vm.players = playersFactory.getPlayers;
    vm.spheros = spherosFactory.getSpheros;

    socket.on('dataChange', function (data) {
        vm.spheros = data.spheros;
        vm.players = data.players;
    });

    socket.on('collision', function (sphero) {
        console.log('collision', sphero);
        for (var i in vm.players) {
            if (vm.players[i].id == sphero.playerId) {
                makeCollision(i);
                break;
            }
        }
    });

    function makeCollision(index) {
        vm['collision' + (index+1)]  = true;
        $timeout(function(){
            vm['collision' + (index+1)]  = false;
        }, 300);
    }

    vm.up = function(index) {
        playersFactory.upPower(index);
        console.log(playersFactory.upPower);
    }

}]);