// IP de la machine qui héberge le serveur node + port
var serverIp = '192.168.43.128:3000';

// IP du téléphone qui stream (fourni dans l'application) + port
var phoneIp = '192.168.43.90:8080';

// IP de l'ordinateur qui lance le dashboard + le port
var webstormServerIp = '192.168.43.128:63343';

(function () {

    var fs = require('fs');

    var file1 = fs.readFileSync(__dirname + '/public-client/index.html', 'utf8');
    file1 = file1.replace(
        /<script src="http:\/\/(.*)\/socket\.io\/socket\.io\.js"><\/script>/g,
        '<script src="http://' + serverIp + '/socket.io/socket.io.js"></script>'
    );
    fs.writeFileSync(__dirname + '/public-client/index.html', file1, 'utf8');

    var file2 = fs.readFileSync(__dirname + '/public-client/js/main.js', 'utf8');
    file2 = file2.replace(
        /var ip = '(.*)';/g,
        "var ip = 'http://" + serverIp + "';"
    );
    fs.writeFileSync(__dirname + '/public-client/js/main.js', file2, 'utf8');

    var file3 = fs.readFileSync(__dirname + '/dashboard/index.html', 'utf8');
    file3 = file3
        .replace(
            /<script src="http:\/\/(.*)\/socket\.io\/socket\.io\.js"><\/script>/g,
            '<script src="http://' + serverIp + '/socket.io/socket.io.js"></script>'
        );
    fs.writeFileSync(__dirname + '/dashboard/index.html', file3, 'utf8');

    var file4 = fs.readFileSync(__dirname + '/dashboard/js/services/home.js', 'utf8');
    file4 = file4
        .replace(
            /io\.connect\('http:\/\/(.*)\/'\)/g,
            "io.connect('http://" + serverIp + "/')"
        );
    fs.writeFileSync(__dirname + '/dashboard/js/services/home.js', file4, 'utf8');

    var file5 = fs.readFileSync(__dirname + '/dashboard/js/controllers/home.js', 'utf8');
    file5 = file5
        .replace(
            /vm\.imgSrc = 'http:\/\/(.*)\/video';/g,
            "vm.imgSrc = 'http://" + phoneIp + "/video';"
        )
        .replace(
            /vm\.urlPublic = 'http:\/\/(.*)\/sphero_battle\/real-balls\/public-client\/index\.html';/g,
            "vm.urlPublic = 'http://" + webstormServerIp + "/sphero_battle/real-balls/public-client/index.html';"
        );
    fs.writeFileSync(__dirname + '/dashboard/js/controllers/home.js', file5, 'utf8');

    var file6 = fs.readFileSync(__dirname + "/android_app/sphero_android_connexion/samples/DriveSample/DriveSampleApp/src/main/java/com/orbotix/drivesample/Connexion.java", 'utf8');
    file6 = file6
        .replace(
            /mSocket = IO\.socket\("http:\/\/(.*)\/"\);/g,
            'mSocket = IO.socket("http://' + serverIp + '/");'
        );
    fs.writeFileSync(__dirname + "/android_app/sphero_android_connexion/samples/DriveSample/DriveSampleApp/src/main/java/com/orbotix/drivesample/Connexion.java", file6, 'utf8');
})();