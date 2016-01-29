function getAjax () {
    if (window.XMLHttpRequest) return new XMLHttpRequest();
    else return new ActiveXObject("Microsoft.XMLHTTP");
}

var player = null;

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
                        var elements = document.querySelectorAll('.while-game');
                        for (var i = 0; i < elements.length; i++) {
                            elements[i].style.display = 'block';
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

        function go (x, y) {
            if (x !== 0 && y !== 0 && player) {
                var http = getAjax();
                http.open('POST', 'http://localhost:3000/api/players/' + player.id + '/deltaX/' + x + '/deltaY/' + y, true);
                http.setRequestHeader("Content-type","application/json");
                http.send();
            }
        }

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
        beginGame();

        function endGame() {
            clearInterval(interval);
        }

        document.querySelector('#cast-spell button').addEventListener('mousedown', _castSpell, false);
        document.querySelector('#cast-spell button').addEventListener('touchstart', _castSpell, false);
        function _castSpell() {
            if (player) {
                var http = getAjax();
                http.open('POST', 'http://localhost:3000/api/players/' + player.id + '/cast-spell', true);
                http.setRequestHeader("Content-type","application/json");
                http.send();
            }
        }

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