app.factory('User', function() {

    function User(id, color) {
        this.id = id;
        this.color = color;
        this.power = 0;
        this.score = 0;
    }

    User.prototype.upScore = function() {
        return this.score++;
    };

    User.prototype.usePower = function() {
        var bool = this.power==100;
        this.power=bool?0:this.power;
        return bool;
    };

    User.prototype.upPower = function() {
        if(this.power!=100) this.power++;
    };

    User.prototype.getScore = function() {
        return this.score;
    };

    return User;
});