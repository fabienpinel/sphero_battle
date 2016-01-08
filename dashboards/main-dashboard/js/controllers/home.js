app.controller('homeCtrl', ['$scope','$rootScope', '$location', 'User', function ($scope, $rootScope, $location, User) {
    $scope.players = [];
    $scope.spheros = [];

    var socket = io.connect('http://localhost:3000');
    socket.on('dataChange', function (data) {
        $scope.spheros = data.spheros;
        $scope.players = data.players;
    });
}]);