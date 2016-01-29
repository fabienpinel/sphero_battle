(function () {

    function getAjax () {
        if (window.XMLHttpRequest) return xmlhttp=new XMLHttpRequest();
        else return xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    var socket = io.connect('http://134.59.214.67:3000');
    var players = [];

    socket.on('dataChange', function (data) {
        players = data.players;
        if (players.length === 2) {
            document.getElementById('player1score').innerHTML = players[0].score;
            document.getElementById('player2score').innerHTML = players[1].score;
        }
    });


    document.getElementById('player1').addEventListener('touchstart', function () {
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', 'http://134.59.214.67:3000/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

    document.getElementById('player2').addEventListener('touchstart', function () {
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', 'http://134.59.214.67:3000/api/players/' + players[1].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

})();