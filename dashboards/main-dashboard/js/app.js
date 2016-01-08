angular.module('mainDashboard', []);

angular.module('mainDashboard').run(function ($http) {
    $http
        .get('http://localhost:3000/hello-world')
        .then(function (response) {
            console.log('success', response);
        })
        .catch(function (error) {
            console.log('unexpected error', error);
        })
});