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
            document.getElementById('info').innerHTML = 'Waiting for 2 players...';
            document.getElementById('info').style.display = 'block';
            document.getElementById('table').style.display = 'none';
        } else if (players.length === 1) {
            document.getElementById('info').innerHTML = 'Waiting for 1 players...';
            document.getElementById('info').style.display = 'block';
            document.getElementById('table').style.display = 'none';
        } else if (players.length === 2) {
            document.getElementById('info').innerHTML = 'osef';
            document.getElementById('info').style.display = 'none';
            document.getElementById('table').style.display = 'block';
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