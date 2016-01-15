var app = angular.module('dashboardPublic', ['ui.router', 'ngMaterial']);


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
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/");
    //
    // Now set up the states
    $stateProvider
        .state('state1', {
            url: "/",
            templateUrl: "js/partials/home.html"
        });
});