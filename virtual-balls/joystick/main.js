
// Login Form Part
(
    function () {
        document.querySelector('#login-form form').addEventListener('submit', function (event) {
            event.preventDefault();
            console.log({
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
            })
        })
    }
)();

// Game Part
(
    function () {

        function getAjax () {
            if (window.XMLHttpRequest) return new XMLHttpRequest();
            else return new ActiveXObject("Microsoft.XMLHTTP");
        }

        function go (x, y) {
            if (x !== 0 && y !== 0) {
                var http = getAjax();
                http.open('POST', 'http://localhost:3000/api/players/player1/deltaX/' + x + '/deltaY/' + y, true);
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

