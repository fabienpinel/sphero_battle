app.controller('homeCtrl', ['$scope','$rootScope', '$location', 'User', function ($scope, $rootScope, $location, User) {

    $scope.status = '  ';
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

    $scope.showAlert = function(ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
       /* $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('This is an alert title')
                .textContent('You can specify some description text in here.')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
                .targetEvent(ev)
        );*/
    };

    function DialogController($scope, $mdDialog) {
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }
}]);