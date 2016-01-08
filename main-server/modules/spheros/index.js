var spheros = [];

module.exports = function () {
    return {
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
        addSphero: function (sphero) {
            var found = false;
            for (var i in spheros) {
                if (spheros[i].id == sphero.id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                spheros.push({
                    id: sphero.id,
                    url: sphero.url
                });
                return true;
            }
            return false;
        },
        associatePlayer: function (playerId) {
            for (var i in spheros) {
                if (! spheros[i].playerId) {
                    spheros[i].player = playerId;
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
};