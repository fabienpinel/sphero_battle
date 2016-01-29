(function () {

    function getAjax () {
        if (window.XMLHttpRequest) return xmlhttp=new XMLHttpRequest();
        else return xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    var socket = io.connect('http://localhost:3000');
    var players = [];

    socket.on('dataChange', function (data) {
        players = data.players;
        if (players.length === 0) {
            document.getElementById('info').innerHTML = "<div class='center'>Waiting for 2 players...</div>";
            document.getElementById('info').style.display = 'block';
        } else if (players.length === 1) {
            document.getElementById('info').innerHTML = "<div class='center'>Waiting for 1 players...</div>";
            document.getElementById('info').style.display = 'block';
        } else if (players.length === 2) {
            document.getElementById('info').innerHTML = "<div class='center'>osef</div>";
            document.getElementById('info').style.display = 'none';
        }
    });


    document.getElementById('player1').addEventListener('click', function () {
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', 'http://localhost:3000/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

    document.getElementById('player2').addEventListener('click', function () {
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', 'http://localhost:3000/players/' + players[1].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

})();