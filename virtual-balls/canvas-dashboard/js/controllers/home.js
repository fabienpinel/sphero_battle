app.controller('homeCtrl', ['$scope','playersFactory','spherosFactory', 'socket', '$timeout', function ($scope,playersFactory,spherosFactory,socket,$timeout) {

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
        drawPlayers();
    });

    vm.up = function(index) {
        playersFactory.upPower(index);
        console.log(playersFactory.upPower);
    };

    socket.on('collision', function (playerIds) {
        console.log('collision', playerIds);
        if(playerIds.length == 2){
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

    /*(function() {
        var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

        NUM_CONFETTI = 350;

        COLORS = [[85, 71, 106], [174, 61, 99], [219, 56, 83], [244, 92, 68], [248, 182, 70]];

        PI_2 = 2 * Math.PI;

        canvas = document.getElementById("world");

        context = canvas.getContext("2d");

        window.w = 0;

        window.h = 0;

        resizeWindow = function() {
            window.w = canvas.width = window.innerWidth;
            return window.h = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeWindow, false);

        window.onload = function() {
            return setTimeout(resizeWindow, 0);
        };

        range = function(a, b) {
            return (b - a) * Math.random() + a;
        };

        drawCircle = function(x, y, r, style) {
            context.beginPath();
            context.arc(x, y, r, 0, PI_2, false);
            context.fillStyle = style;
            return context.fill();
        };

        xpos = 0.5;

        document.onmousemove = function(e) {
            return xpos = e.pageX / w;
        };

        window.requestAnimationFrame = (function() {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                    return window.setTimeout(callback, 1000 / 60);
                };
        })();

        Confetti = (function() {
            function Confetti() {
                this.style = COLORS[~~range(0, 5)];
                this.rgb = "rgba(" + this.style[0] + "," + this.style[1] + "," + this.style[2];
                this.r = ~~range(2, 6);
                this.r2 = 2 * this.r;
                this.replace();
            }

            Confetti.prototype.replace = function() {
                this.opacity = 0;
                this.dop = 0.03 * range(1, 4);
                this.x = range(-this.r2, w - this.r2);
                this.y = range(-20, h - this.r2);
                this.xmax = w - this.r;
                this.ymax = h - this.r;
                this.vx = range(0, 2) + 8 * xpos - 5;
                return this.vy = 0.7 * this.r + range(-1, 1);
            };

            Confetti.prototype.draw = function() {
                var ref;
                this.x += this.vx;
                this.y += this.vy;
                this.opacity += this.dop;
                if (this.opacity > 1) {
                    this.opacity = 1;
                    this.dop *= -1;
                }
                if (this.opacity < 0 || this.y > this.ymax) {
                    this.replace();
                }
                if (!((0 < (ref = this.x) && ref < this.xmax))) {
                    this.x = (this.x + this.xmax) % this.xmax;
                }
                return drawCircle(~~this.x, ~~this.y, this.r, this.rgb + "," + this.opacity + ")");
            };

            return Confetti;

        })();

        confetti = (function() {
            var j, ref, results;
            results = [];
            for (i = j = 1, ref = NUM_CONFETTI; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
                results.push(new Confetti);
            }
            return results;
        })();

        window.step = function() {
            var c, j, len, results;
            requestAnimationFrame(step);
            context.clearRect(0, 0, w, h);
            results = [];
            for (j = 0, len = confetti.length; j < len; j++) {
                c = confetti[j];
                results.push(c.draw());
            }
            return results;
        };

        step();

    }).call(this);*/

}]);