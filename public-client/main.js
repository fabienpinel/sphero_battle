(function () {

    var scriptSrc = document.querySelector('script').src.split(':');
    var IP = scriptSrc[1].split('//')[1];
    var PORT = scriptSrc[2].split('/socket.io/')[0];
    var BASE_URL = 'http://' + IP + ':' + PORT;

    var socket = io.connect(BASE_URL);

    var players = [];

    socket.on('dataChange', function (data) {
        players = data.players;
        if (players.length == 0) {
            document.querySelector('.message-wrapper').style.display = 'block';
            document.querySelector('.message-wrapper').innerHTML = 'en attente de 2 joueurs...';
            document.querySelector('.buttons-wrapper').style.display = 'none';
        } else if (players.length == 1) {
            document.querySelector('.message-wrapper').style.display = 'block';
            document.querySelector('.message-wrapper').innerHTML = 'en attente de 1 joueur...';
            document.querySelector('.buttons-wrapper').style.display = 'none';
        } else if (players.length == 2) {
            document.querySelector('.message-wrapper').style.display = 'none';
            document.querySelector('.buttons-wrapper').style.display = 'block';
        }
    });

    function getAjax () {
        if (window.XMLHttpRequest)
        {// code for IE7+, Firefox, Chrome, Opera, Safari
            return xmlhttp=new XMLHttpRequest();
        }
        else
        {// code for IE6, IE5
            return xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
    }

    document.getElementById('player1').addEventListener('click', function () {
        if (players.length == 2) {
            var http = getAjax();
            http.open('POST', BASE_URL + '/players/' + players[0].id + '/vote', true);
            xmlhttp.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

    document.getElementById('player2').addEventListener('click', function () {
        if (players.length == 2) {
            var http = getAjax();
            http.open('POST', BASE_URL + '/players/' + players[1].id + '/vote', true);
            xmlhttp.setRequestHeader("Content-type","application/json");
            http.send();
        }

    }, false);


})();