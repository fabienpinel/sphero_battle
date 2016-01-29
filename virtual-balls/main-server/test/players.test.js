var assert = require('assert');
var players = require('../modules/players');

describe('Test Players Model', function () {

    var player1 = {id: 1};
    var player2 = {id: 2};

    describe('Create 2 players', function () {

        it ('Should create Player 1', function () {
            player1 = players.registerPlayer(player1.id, 'IMMUNITY');
            assert(50, player1.position.x);
            assert(50, player1.position.y);
            assert('SLOW_DOWN', player1.spell);
        });

        it ('Should create Player 2', function () {
            player2 = players.registerPlayer(player2.id, 'CONTROL_REVERSAL');
            assert(950, player2.position.x);
            assert(950, player2.position.y);
            assert('CONTROL_REVERSAL', player2.spell);
        });

        it ('Shoud not create Player 3', function () {
            var player3 = players.registerPlayer(3, 'CONTROL_REVERSAL');
            assert(!player3);
        });

    });

    describe('Players Cast Spell', function () {

        it ('Player 1 should cast IMMUNITY', function (done) {
            this.timeout(4000);
            players.castSpell(player1.id);
            assert.equal('IMMUNITY', players.getPlayerById(player1.id).spellEffect);
            setTimeout(function () {
                assert.equal(undefined, players.getPlayerById(player1.id).spellEffect);
                done();
            }, 3010);
        });

        it ('Player 2 Should cast CONTROL_REVERSAL on Player1', function (done) {
            this.timeout(4000);
            players.castSpell(player2.id);
            assert.equal('CONTROL_REVERSAL', players.getOtherPlayerById(player2.id).spellEffect);
            setTimeout(function () {
                assert.equal(undefined, players.getPlayerById(player2.id).spellEffect);
                done();
            }, 3010);
        });

    });

});