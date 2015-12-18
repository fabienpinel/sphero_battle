var speed = 180;

module.exports = {
    helloWorld: function (req, res ,orb) {
        console.log(orb);
        return res.status(200).end();
    },

    changeColor: function (req, res, orb) {
        return res.status(201).end();
    },

    move: function (req, res, orb) {
        console.log(req.params.distance, req.params.angle);
        if (req.params.distance == 0 && req.params.angle == 0) {
            orb.stop();
        } else {
            orb.roll(parseInt(req.params.distance) / 5, parseInt(req.params.angle) % 360);
        }
        return res.status(201).end();
    }
};