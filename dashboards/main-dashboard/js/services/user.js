app.factory('User', function() {

    function User(id, color) {
        this.id = id;
        this.color = color;
        this.power1 = 0;
        this.power2 = 0;
        this.power3 = 0;
        this.score = 0;
    }

    User.prototype.upScore = function() {
        return this.score++;
    };

    User.prototype.usePower1 = function() {
        var bool = this.power1==100;
        this.power1=bool?0:this.power1;
        return bool;
    };

    User.prototype.usePower2 = function() {
        var bool = this.power2==100;
        this.power2=bool?0:this.power2;
        return bool;
    };

    User.prototype.powerLevel3 = function() {
        var bool = this.power3==100;
        this.power3=bool?0:this.power3;
        return bool;
    };

    User.prototype.upPower1 = function() {
        if(this.power1!=100) this.power1++;
    };

    User.prototype.upPower2 = function() {
        if(this.power2!=100) this.power2++;
    };

    User.prototype.upPower3 = function() {
        if(this.power3!=100) this.power3++;
    };

    User.prototype.getScore = function() {
        return this.score;
    };

    return User;
});