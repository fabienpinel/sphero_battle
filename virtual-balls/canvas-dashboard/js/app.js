var app = angular.module('dashboardPublic', ['ui.router', 'ngMaterial', 'btford.socket-io', 'ngAudio']);

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
    // For any unmatched url, redirect to /home
    $urlRouterProvider.otherwise("/");
});