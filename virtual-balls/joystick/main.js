function getAjax () {
    if (window.XMLHttpRequest) return new XMLHttpRequest();
    else return new ActiveXObject("Microsoft.XMLHTTP");
}

var player = null;
var reloadingSpellCast = false;
var players = [];

// Login Form Part
(
    function () {
        document.querySelector('#login-form form').addEventListener('submit', function (event) {
            event.preventDefault();
            var data = {
                name: document.querySelector('#login-form input.mdl-textfield__input').value,
                spell:
                    document.querySelector('#login-form input#option-1').checked ?
                        'SLOW_DOWN' :
                        document.querySelector('#login-form input#option-2').checked ?
                            'CONTROL_REVERSAL' :
                            document.querySelector('#login-form input#option-3').checked ?
                                'HEAL' :
                                document.querySelector('#login-form input#option-4').checked ?
                                    'IMMUNITY'
                                    :null
            };
            if (!player) {
                var http = getAjax();
                http.open('POST', 'http://localhost:3000/api/players/', true);
                http.setRequestHeader("Content-type","application/json");
                http.onload = function (response) {
                    if (response.currentTarget.status == 409) {
                        alert('le serveur est full');
                    } else if (response.currentTarget.status == 201) {
                        player = JSON.parse(response.currentTarget.responseText);
                        document.querySelector('#login-form').style.display = 'none';
                        if (players.length === 2) {
                            document.querySelector('#waiting .center').innerHTML = 'laule';
                            document.querySelector('#waiting').style.display = 'none';
                            var elements = document.querySelectorAll('.while-game');
                            for (var i = 0; i < elements.length; i++) {
                                elements[i].style.display = 'block';
                            }
                        } else if (players.length == 1) {
                            document.querySelector('#waiting .center').innerHTML = 'Waiting for 1 players';
                            document.querySelector('#waiting').style.display = 'block';
                            var elements = document.querySelectorAll('.while-game');
                            for (var i = 0; i < elements.length; i++) {
                                elements[i].style.display = 'none';
                            }
                        } else {
                            document.querySelector('#waiting .center').innerHTML = 'Waiting for 2 players';
                            document.querySelector('#waiting').style.display = 'block';
                            var elements = document.querySelectorAll('.while-game');
                            for (var i = 0; i < elements.length; i++) {
                                elements[i].style.display = 'none';
                            }
                        }
                    }
                };
                http.send(JSON.stringify(data));
            }
        });
    }
)();

// Game Part
(
    function () {

        var socket = io.connect('http://localhost:3000');

        socket.on('dataChange', function (data) {
            players = data.players;
            if (player) {
                if (players.length === 2) {
                    document.querySelector('#waiting .center').innerHTML = 'laule';
                    document.querySelector('#waiting').style.display = 'none';
                    var elements = document.querySelectorAll('.while-game');
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].style.display = 'block';
                    }
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].id == player.id && players[i]) {
                            player = players[i];
                            if (players[i].power >= 10 && !reloadingSpellCast) {
                                document.querySelector('#cast-spell button').removeAttribute("disabled");
                            } else {
                                document.querySelector('#cast-spell button').setAttribute("disabled", "");
                            }
                            break;
                        }
                    }
                } else if (players.length == 1) {
                    document.querySelector('#waiting .center').innerHTML = 'Waiting for 1 players';
                    document.querySelector('#waiting').style.display = 'block';
                    var elements = document.querySelectorAll('.while-game');
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].style.display = 'none';
                    }
                } else {
                    document.querySelector('#waiting .center').innerHTML = 'Waiting for 2 players';
                    document.querySelector('#waiting').style.display = 'block';
                    var elements = document.querySelectorAll('.while-game');
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].style.display = 'none';
                    }
                }
            } else {
                document.querySelector('#waiting').style.display = 'none';
                var elements = document.querySelectorAll('.while-game');
                for (var i = 0; i < elements.length; i++) {
                    elements[i].style.display = 'none';
                }
            }

        });

        socket.on('start', function () {
            displayTimer(60);
            beginGame();
        });

        socket.on('end', function () {
            location.reload();
        });

        socket.on('break', function () {
            endGame();
        });

        function go (x, y) {
            if (x !== 0 && y !== 0 && player) {
                var http = getAjax();
                http.open('POST', 'http://localhost:3000/api/players/' + player.id + '/deltaX/' + x + '/deltaY/' + y, true);
                http.setRequestHeader("Content-type","application/json");
                http.send();
            }
        }

        var timerTimeout = null;
        function displayTimer(number) {
            document.querySelector('#timer').innerHTML = number;
            if (number > 0) {
                timerTimeout = setTimeout(function () {
                    displayTimer(number - 1);
                    console.log(number);
                }, 1000);
            }
        }

        /////////////////// JOYSTICK PART ///////////////////
        var joystick = new VirtualJoystick({
            container: document.getElementById('joystick'),
            mouseSupport: true
        });
        var interval = null;
        function beginGame() {
            interval = setInterval(function(){
                if (actualPoint && originalPoint) {
                    var centerX = originalPoint.x;
                    var centerY = originalPoint.y;
                    var pointerX = actualPoint.x;
                    var pointerY = actualPoint.y;
                    go(parseInt((pointerX - centerX) / 5), - parseInt((centerY - pointerY) / 5));
                }
            }, 30);
        }
        function endGame() { clearInterval(interval); clearTimeout(timerTimeout); }
        /////////////////// JOYSTICK PART (END) ///////////////////

        /////////////////// CAST SPELL PART ///////////////////
        document.querySelector('#cast-spell button').addEventListener('mousedown', _castSpell, false);
        document.querySelector('#cast-spell button').addEventListener('touchstart', _castSpell, false);
        function _castSpell() {
            if (player) {
                var http = getAjax();
                http.open('POST', 'http://localhost:3000/api/players/' + player.id + '/cast-spell', true);
                http.setRequestHeader("Content-type","application/json");
                http.onload = function (response) {
                    if (response.currentTarget.status == 404) {
                        // marche pas osef
                    } else if (response.currentTarget.status == 201) {
                        reloadingSpellCast = true;
                        document.querySelector('#cast-spell button').setAttribute("disabled", "");
                        setTimeout(function () {
                            reloadingSpellCast = false;
                            if (player.score >= 10) document.querySelector('#cast-spell button').removeAttribute("disabled");
                        }, 3000);
                    }
                };
                http.send();
            }
        }
        /////////////////// CAST SPELL PART (END) ///////////////////

        /////////////////// GESTURE PART ///////////////////
        var clicked = false;
        var originalPoint = null;
        var actualPoint = null;
        document.querySelector('#joystick').addEventListener('mousedown', function (e) { clicked = true; originalPoint = {x: e.clientX,y: e.clientY }; });
        document.querySelector('#joystick').addEventListener('mouseup', function () {clicked = false;actualPoint = null;originalPoint = null;});
        document.querySelector('#joystick').addEventListener('mousemove', function (e) { if (clicked) actualPoint = {x: e.clientX, y: e.clientY}; });
        document.querySelector('#joystick').addEventListener('touchstart', function (e) { clicked = true; originalPoint = {x: e.touches[0].clientX,y: e.touches[0].clientY }; });
        document.querySelector('#joystick').addEventListener('touchend', function () { clicked = false;actualPoint = null;originalPoint = null; });
        document.querySelector('#joystick').addEventListener('touchmove', function (e) { if (clicked) actualPoint = {x: e.touches[0].clientX, y: e.touches[0].clientY}; });
        /////////////////// GESTURE PART (END) ///////////////////
    }
)();

window.onbeforeunload = function () {
    if (player) {
        var http = getAjax();
        http.open('DELETE', 'http://localhost:3000/api/players/' + player.id, true);
        http.setRequestHeader("Content-type","application/json");
        http.send();
    }
};