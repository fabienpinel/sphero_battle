var sockets = require('../sockets');
var DURATION = 3000;

module.exports = {

    castSpell: function (spellType, toPlayer) {
        if (!toPlayer.spellEffect) {
            toPlayer.spellEffect = spellType;
            sockets.emitChanges();
            setTimeout(function () {
                delete toPlayer.spellEffect;
                sockets.emitChanges();
            }, DURATION);
        }
    }

};