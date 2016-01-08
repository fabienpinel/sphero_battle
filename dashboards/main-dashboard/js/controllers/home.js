app.controller('homeCtrl', ['$scope','$rootScope', '$location', 'User', function ($scope, $rootScope, $location, User) {
    $scope.user1 = new User(1, 'blue');
    $scope.user2 = new User(2, 'green');

}]);