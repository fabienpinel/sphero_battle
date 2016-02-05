var app = angular.module('dashboardPublic', ['ui.router', 'ngMaterial', 'btford.socket-io']);


// premier block ex?cut? dans Angular
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

app.config(function($stateProvider, $urlRouterProvider) {

    //
    // Now set up the states
    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "js/partials/home.html",
            controller: "homeCtrl",
            controllerAs: "home"
        });

    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/");
});