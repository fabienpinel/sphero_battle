var DURATION = 3000;

module.exports = {

    castSpell: function (spellType, toPlayer) {
        if (!toPlayer.spellEffect) {
            toPlayer.spellEffect = spellType;
            setTimeout(function () {
                delete toPlayer.spellEffect;
            }, DURATION);
        }
    }

};