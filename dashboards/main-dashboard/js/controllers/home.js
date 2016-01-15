app.controller('homeCtrl', ['$scope','$rootScope', '$location', 'User', function ($scope, $rootScope, $location, User) {
    $scope.players = [];
    $scope.spheros = [];

    var socket = io.connect('http://localhost:3000');
    socket.on('dataChange', function (data) {
        $scope.spheros = data.spheros;
        $scope.players = data.players;
    });

    var self = this,  j= 0, counter = 0;
    self.modes = [ ];
    self.activated = true;
    self.determinateValue = 30;
    /**
     * Turn off or on the 5 themed loaders
     */
    self.toggleActivation = function() {
        if ( !self.activated ) self.modes = [ ];
        if (  self.activated ) j = counter = 0;
    };
}]);