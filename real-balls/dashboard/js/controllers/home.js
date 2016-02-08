
app.controller('homeCtrl',
['$scope', 'socket', '$timeout', '$window', 'ngAudio',
function ($scope, socket, $timeout, $window, ngAudio) {

    var vm = this;
    vm.end = false;
    vm.init = true;
    vm.collision1 = vm.collision2 = false;
    vm.players = [];
    vm.resultats = [];
    vm.power1 = vm.power2 = null;
    vm.timer = 120;

    vm.collisionSound = ngAudio.load("./audio/collision.wav");
    vm.replaySound = ngAudio.load("./audio/replay.wav");
    vm.spellSound = ngAudio.load("./audio/spell.wav");
    vm.endSound = ngAudio.load("./audio/end.wav");

    $timeout(function(){
       vm.init = false;
    }, 2000);

    socket.on('dataChange', function (data) {
        vm.players = data.players;
    });

    vm.replay = function() {
        vm.replaySound.play();
        $timeout(function(){
            $window.location.reload();
        }, 1000);
    };

    socket.on('start', function(){
        vm.timer = 120;
        decreaseTime();
    });

    var timerTimeout = null;
    function decreaseTime() {
        vm.timer--;
        if (vm.timer > 0) {
            timerTimeout = $timeout(function () {
                decreaseTime();
            }, 1000);
        }
    }

    socket.on('collision', function (playerIds) {
        vm.collisionSound.play();
    });

    socket.on('end', function(results) {
        vm.endSound.play();
        vm.end = true;
        vm.resultats = results;
        $timeout.cancel(timerTimeout);
    });

    socket.on('break', function () {
        $timeout.cancel(timerTimeout);
    });

    socket.on('cast', function(player){
        vm.spellSound.play();
        if(vm.players[0].id == player.playerId) {
            vm.power1 = player.spellType;
            $timeout(function() {
                vm.power1 = null;
            }, 3000);
        } else if (vm.players[1].id == player.playerId) {
            vm.power2 = player.spellType;
            $timeout(function(){
                vm.power2 = null;
            }, 3000);
        }
    });


    var video = document.querySelector("#videoElement");
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true}, handleVideo, videoError);
    }

    function handleVideo(stream) { video.src = window.URL.createObjectURL(stream); }
    function videoError(e) {}


}]);