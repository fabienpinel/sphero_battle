var app = angular.module('mainDashboard', ['ngRoute']);

app.config([ '$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'js/partial/index.html',
            controller: 'homeCtrl',
            controllerAs: 'home'
        })
        .otherwise({redirectTo : '/'});
}]);

app.directive('home', ['homeCtrl', function(){
    return {
        restrict: 'E',
        templateUrl: 'js/partial/index.html',
        scope: {
            players: "@players",
            spheros: "@spheros"
        }
    }
}]);

// premier block ex�cut� dans Angular
app.run([ '$rootScope','$location',  function ($rootScope, $location) {
    /*$http
        .get('http://localhost:3000/hello-world')
        .then(function (response) {
            console.log('success', response);
        })
        .catch(function (error) {
            console.log('unexpected error', error);
        });*/
}]);