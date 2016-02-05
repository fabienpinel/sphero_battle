
app.controller('homeCtrl', ['$scope','playersFactory','spherosFactory', 'socket', '$timeout', '$window', 'ngAudio',function ($scope,playersFactory,spherosFactory,socket,$timeout,$window,ngAudio) {

    var vm = this;
    vm.end = false;
    vm.init = true;
    vm.collision1 = vm.collision2 = false;
    vm.players = playersFactory.getPlayers;
    vm.resultats = playersFactory.getPlayers;
    vm.spheros = spherosFactory.getSpheros;
    vm.power1 = vm.power2 = null;

    vm.collisionSound = ngAudio.load("./audio/collision.wav");
    vm.replaySound = ngAudio.load("./audio/replay.wav");
    vm.spellSound = ngAudio.load("./audio/spell.wav");

    $timeout(function(){
       vm.init = false;
    }, 2000);

    socket.on('dataChange', function (data) {
        vm.spheros = data.spheros;
        vm.players = data.players;
        drawPlayers();
    });

    vm.up = function(index) {
        playersFactory.upPower(index);
    };

    vm.replay = function() {
        vm.replaySound.play();
        $timeout(function(){
            $window.location.reload();
        }, 1000);
    };

    socket.on('collision', function (playerIds) {
        vm.collisionSound.play();
        /*if(playerIds.length == 2){
            vm.collision1 = vm.collision2 = true;
            $timeout(function(){
                vm.collision1 = vm.collision2 = false;
            }, 300);
        } else if (playerIds[0] == vm.players[0].id) {
            vm.collision1 = true;
            $timeout(function(){
                vm.collision1 = false;
            }, 300);
        } else {
            vm.collision2 = true;
            $timeout(function(){
                vm.collision2 = false;
            }, 300);
        }*/
    });

    socket.on('end', function(results) {
        vm.end = true;
        vm.resultats = results;
    });

    socket.on('cast', function(player){
        vm.spellSound.play();
        if(vm.players[0].id == player.playerId) {
            vm.power1 = player.spellType;
            $timeout(function(){
                vm.power1 = null;
            }, 3000);
        } else if (vm.players[1].id == player.playerId) {
            vm.power2 = player.spellType;
            $timeout(function(){
                vm.power2 = null;
            }, 3000);
        }
    });

    // GESTION DU CANVAS

    var GAME_HORIZONTAL = 1000;
    var GAME_VERTICAL = 1000;
    var BALL_RADIUS = 50;

    var REAL_WIDTH = 480;
    var REAL_HEIGHT = 480;
    var REAL_RADIUS = BALL_RADIUS * REAL_WIDTH / GAME_HORIZONTAL;

    var stage = circle1 = circle2 = null;

    function init() {
        stage = new createjs.Stage("demoCanvas");
    }
    init();

    function drawPlayers() {
        if (vm.players.length === 0) {
            if (circle1) {
                stage.removeChild(circle1);
                circle1 = null;
            }
            if (circle2) {
                stage.removeChild(circle2);
                circle2 = null;
            }
            return stage.update();
        }

        if (!circle1) {
            circle1 = new createjs.Shape();
            circle1.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50 * REAL_RADIUS / BALL_RADIUS);
            stage.addChild(circle1);
        }

        circle1.x = vm.players[0].position.x * REAL_WIDTH / GAME_HORIZONTAL;
        circle1.y = vm.players[0].position.y * REAL_HEIGHT / GAME_VERTICAL;

        if (vm.players.length === 1) {
            if (circle2) {
                stage.removeChild(circle2);
                circle2 = null;
            }
            return stage.update();
        }

        if (!circle2) {
            circle2 = new createjs.Shape();
            circle2.graphics.beginFill("red").drawCircle(0, 0, 50 * REAL_RADIUS / BALL_RADIUS);
            stage.addChild(circle2);
        }

        circle2.x = vm.players[1].position.x * REAL_WIDTH / GAME_HORIZONTAL;
        circle2.y = vm.players[1].position.y * REAL_HEIGHT / GAME_VERTICAL;

        stage.update();
    }

}]);