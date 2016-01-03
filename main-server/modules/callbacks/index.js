module.exports = {
    helloWorld: function (req, res) {
        res.status(200).json('hello world !');
    },
    collision: function (req, res) {
        res.status(200).json('collision !');
    },
    registerSphero: function (req, res) {
        res.status(200).json('register Sphero !');
    },
    registerMyo: function (req, res) {
        res.status(200).json('register Myo !');
    },
    moveSphero: function (req, res) {
        res.status(200).json('move!');
    }
};