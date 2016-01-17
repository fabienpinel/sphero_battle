var spheroConnect = require('./modules/connect');
spheroConnect('RPP', function (orb) {

    orb.color("green");
    setTimeout(function () {
        orb.color("red");
    }, 1000);
    setTimeout(function () {
        orb.color("blue");
    }, 2000);
    orb.on('collision', function () {
        console.log('coucou');
        orb.color("red");
        setTimeout(function () {
            orb.color("green");
        }, 1000);
    });

    orb.detectCollisions();

});