var fs = require('fs');
var serverIp = 'localhost:3000';
var phoneIp = '192.168.1.16:8080';

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
);
fs.writeFileSync(__dirname + '/dashboard/js/controllers/home.js', file5, 'utf8');