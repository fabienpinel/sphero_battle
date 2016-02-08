(function () {

    function getAjax () {
        if (window.XMLHttpRequest) return xmlhttp=new XMLHttpRequest();
        else return xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    var socket = io.connect('http://134.59.215.166:3000');
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

        document.getElementById('player2score').innerHTML = players[1].power;
        document.getElementById('player1score').innerHTML = players[0].power;
    });

    document.getElementById('player1').addEventListener('touchstart', function () {
        console.log('coucou');
        if (players.length === 2) {
            console.log('coucou2');
            var http = getAjax();
            http.open('POST', 'http://134.59.215.166:3000/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

    document.getElementById('player2').addEventListener('touchstart', function () {
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', 'http://134.59.215.166:3000/api/players/' + players[1].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

})();