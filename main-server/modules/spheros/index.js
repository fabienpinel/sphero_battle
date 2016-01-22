var spheros = [];

module.exports = {
    getSpheros: function () {
        return spheros;
    },
    deleteSpheroById: function (id) {
        for (var i in spheros) {
            if (spheros[i].id == id) {
                spheros.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    getSpheroById: function (id) {
        for (var i in spheros) {
            if (spheros[i].id == id) {
                return spheros[i];
            }
        }
        return null;
    },
    addSphero: function (spheroId) {
        var found = false;
        for (var i in spheros) {
            if (spheros[i].id == spheroId) {
                found = true;
                break;
            }
        }
        if (!found) {
            spheros.push({
                id: spheroId
            });
            return true;
        }
        return false;
    },
    associatePlayer: function (playerId) {
        for (var i in spheros) {
            if (! spheros[i].playerId) {
                spheros[i].playerId = playerId;
                return spheros[i];
            }
        }
        return null;
    },
    deletePlayer: function (playerId) {
        for (var i in spheros) {
            if (spheros[i].playerId == playerId) {
                delete spheros[i].playerId;
                return true;
            }
        }
        return false;
    }
};