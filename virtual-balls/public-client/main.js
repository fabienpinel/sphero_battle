var ip = 'http://localhost:3000';

(function () {

    function getAjax () {
        if (window.XMLHttpRequest) return xmlhttp=new XMLHttpRequest();
        else return xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    var socket = io.connect(ip);
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
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

    document.getElementById('player2').addEventListener('touchstart', function () {
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[1].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    }, false);

    document.getElementById('im1').addEventListener("touchstart", function(){
        var toRemove = document.getElementsByClassName("selected1");
        for(var i = 0; i < toRemove.length; i++) {
            toRemove[i].className = toRemove[i].className.replace(/\bselected1\b/,'');
        };
        document.getElementById('im1').className += " selected1";
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    });
    document.getElementById('im2').addEventListener("touchstart", function(){
        var toRemove = document.getElementsByClassName("selected2");
        for(var i = 0; i < toRemove.length; i++) {
            toRemove[i].className = toRemove[i].className.replace(/\bselected2\b/,'');
        };
        document.getElementById('im2').className += " selected2";
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    });

    document.getElementById('hl1').addEventListener("touchstart", function(){
        var toRemove = document.getElementsByClassName("selected1");
        for(var i = 0; i < toRemove.length; i++) {
            toRemove[i].className = toRemove[i].className.replace(/\bselected1\b/,'');
        };
        document.getElementById('hl1').className += " selected1";
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
     });
    document.getElementById('hl2').addEventListener("touchstart", function(){
        var toRemove = document.getElementsByClassName("selected2");
        for(var i = 0; i < toRemove.length; i++) {
            toRemove[i].className = toRemove[i].className.replace(/\bselected2\b/,'');
        };
        document.getElementById('hl2').className += " selected2";
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    });

    document.getElementById('sl1').addEventListener("touchstart", function(){
        var toRemove = document.getElementsByClassName("selected1");
        for(var i = 0; i < toRemove.length; i++) {
            toRemove[i].className = toRemove[i].className.replace(/\bselected1\b/,'');
        };
        document.getElementById('sl1').className += " selected1";
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
     });
    document.getElementById('sl2').addEventListener("touchstart", function(){
        var toRemove = document.getElementsByClassName("selected2");
        for(var i = 0; i < toRemove.length; i++) {
            toRemove[i].className = toRemove[i].className.replace(/\bselected2\b/,'');
        };
        document.getElementById('sl2').className += " selected2";
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    });

    document.getElementById('cr1').addEventListener("touchstart", function(){
        var toRemove = document.getElementsByClassName("selected1");
        for(var i = 0; i < toRemove.length; i++) {
            toRemove[i].className = toRemove[i].className.replace(/\bselected1\b/,'');
        }
        document.getElementById('cr1').className += " selected1";
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    });
    document.getElementById('cr2').addEventListener("touchstart", function(){
        var toRemove = document.getElementsByClassName("selected2");
        for(var i = 0; i < toRemove.length; i++) {
            toRemove[i].className = toRemove[i].className.replace(/\bselected2\b/,'');
        }
        document.getElementById('cr2').className += " selected2";
        if (players.length === 2) {
            var http = getAjax();
            http.open('POST', ip + '/api/players/' + players[0].id + '/power', true);
            http.setRequestHeader("Content-type","application/json");
            http.send();
        }
    });

})();