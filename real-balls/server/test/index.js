var assert = require('assert');
var buildServer = require('../server.js');
var request = require('supertest');
var api = require('../libs/api');

describe('API Tests', function () {

    var player1 = {};
    var player2 = {};
    var server = null;

    before(function (done) {
        buildServer(function (_server) {
            server = _server;
            done();
        });
    });

    after(function (done) {
        server.close(done);
    });

    describe('Register players', function () {

        it('Should register player 1', function (done) {
            request(server)
                .post('/api/players')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    assert.equal('Player 1', res.body.name);
                    player1 = res.body;

                    done();
                });
        });

        it('Should register player 2', function (done) {
            request(server)
                .post('/api/players')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    assert.equal('Player 2', res.body.name);
                    player2 = res.body;

                    done();
                });
        });

        it('Should NOT register player because server is full', function (done) {
            request(server)
                .post('/api/players')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) throw err;

                    // check for good response
                    assert.equal(409, res.status);

                    done();
                });
        });

    });

    describe('Post Collision', function () {

        it('Should post collision player 1', function (done) {
            request(server)
                .post('/api/players/' + player1.id + '/collision')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    assert.equal(99, api._getPlayers()[0].life);

                    done();
                });
        });

    });

    describe('Post power', function () {
        it('Should post power player 1', function (done) {
            request(server)
                .post('/api/players/' + player1.id + '/power')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    assert.equal(1, api._getPlayers()[0].power);

                    done();
                });
        });
    });

    describe('Cast Spell', function () {
        this.timeout(3200);
        it('player 1 should cast spell SLOW_DOWN', function (done) {
            var players = api._getPlayers();
            players[0].power = 21;
            request(server)
                .post('/api/players/' + player1.id + '/cast')
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    assert.equal(1, players[0].power);
                    assert.equal('SLOW_DOWN', players[1].spellEffect);

                    setTimeout(function () {
                        assert.equal(undefined, players[1].spellEffect);
                        done();
                    },3000);
                });
        });
    });

    describe('Delete player', function () {

        it('player 1 should disconnect', function () {
            request(server)
                .delete('/api/players/' + player1.id)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) throw err;

                    // check for good response
                    assert.equal(204, res.status);
                    done();
                });
        });

        it('player 2 should disconnect', function () {
            request(server)
                .delete('/api/players/' + player2.id)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) throw err;

                    // check for good response
                    assert.equal(204, res.status);
                    done();
                });
        });

    });

});