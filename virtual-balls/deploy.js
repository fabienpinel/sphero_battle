// IP de la machine qui héberge le serveur node + port
var serverIp = 'localhost:3000';

(function () {

    var fs = require('fs');

    var file1 = fs.readFileSync(__dirname + '/public-client/index.html', 'utf8');
    file1 = file1.replace(
        /<script src="http:\/\/(.*)\/socket\.io\/socket\.io\.js"><\/script>/g,
        '<script src="http://' + serverIp + '/socket.io/socket.io.js"></script>'
    );
    fs.writeFileSync(__dirname + '/public-client/index.html', file1, 'utf8');

    var file2 = fs.readFileSync(__dirname + '/public-client/main.js', 'utf8');
    file2 = file2.replace(
        /var ip = '(.*)';/g,
        "var ip = 'http://" + serverIp + "';"
    );
    fs.writeFileSync(__dirname + '/public-client/main.js', file2, 'utf8');

    var file3 = fs.readFileSync(__dirname + '/canvas-dashboard/index.html', 'utf8');
    file3 = file3
        .replace(
            /<script src="http:\/\/(.*)\/socket\.io\/socket\.io\.js"><\/script>/g,
            '<script src="http://' + serverIp + '/socket.io/socket.io.js"></script>'
        );
    fs.writeFileSync(__dirname + '/canvas-dashboard/index.html', file3, 'utf8');

    var file4 = fs.readFileSync(__dirname + '/canvas-dashboard/js/services/home.js', 'utf8');
    file4 = file4
        .replace(
            /io\.connect\('http:\/\/(.*)\/'\)/g,
            "io.connect('http://" + serverIp + "/')"
        );
    fs.writeFileSync(__dirname + '/canvas-dashboard/js/services/home.js', file4, 'utf8');

    var file5 = fs.readFileSync(__dirname + '/joystick/joystick.html', 'utf8');
    file5 = file5
        .replace(
            /<script src="http:\/\/(.*)\/socket\.io\/socket\.io\.js"><\/script>/g,
            '<script src="http://' + serverIp + '/socket.io/socket.io.js"></script>'
        );
    fs.writeFileSync(__dirname + '/joystick/joystick.html', file5, 'utf8');

    var file6 = fs.readFileSync(__dirname + '/joystick/main.js', 'utf8');
    file6 = file6
        .replace(
            /var ip = '(.*)';/g,
            "var ip = 'http://" + serverIp + "';"
        );
    fs.writeFileSync(__dirname + '/joystick/main.js', file6, 'utf8');

})();