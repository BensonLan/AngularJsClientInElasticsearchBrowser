

/* Configs */
var indexName = "2014";
var docType = "jdbc";
var maxResultsSize = 10;
var host = "http://192.168.1.143";
var port = "9200";

/* Module */
window.record = angular.module('record', ['elasticsearch'],
    ['$locationProvider', function($locationProvider){
        $locationProvider.html5Mode(true);
    }]
);

/* Service to ES */
record.factory('recordService',
    ['$q', 'esFactory', '$location', function($q, elasticsearch, $location){

        //Defaults if host and port aren't configured above
        var esHost = (host.length > 0 ) ? host : $location.host();
        var esPort = (port.length > 0 ) ? port : 9200;

        var client = elasticsearch({ host: esHost + ":" + esPort });

        var search = function(term){

            var deferred = $q.defer();

            client.search({
                "index": indexName,
                "type": docType,
                "body": {
                    "size": maxResultsSize,
                    "query": {
                        "match": {
                            "_all": term
                        }
                    }
                }
            }).then(function(result) {
                var ii = 0, hits_in, hits_out = [];
                hits_in = (result.hits || {}).hits || [];
                for(;ii < hits_in.length; ii++){
                    hits_out.push(hits_in[ii]._source);
                }
                deferred.resolve(hits_out);
            }, deferred.reject);
            return deferred.promise;
        };
        return {
            "search": search
        };
    }]
);

/* Controller
 *
 * On change in search box, search() will be called, and results are bind to scope as results[]
 *
 */
record.controller('recordCtrl', ['recordService', '$scope', '$location', function(recordService, $scope, $location){


        //On search, reinitialize array, then perform search and load results
        $scope.search = function(){
            $scope.results = [];
            $location.search({'q': $scope.query});
            $scope.loadResults();
        };

        //Load search results into array
        $scope.loadResults = function() {
            recordService.search($scope.query).then(function(results) {
                var ii = 0;
                for(;ii < results.length; ii++){
                    $scope.results.push(results[ii]);
                }
            });
        };

        //Init empty array
        $scope.results = [];
        $scope.query= $location.search().q;
        $scope.loadResults();


    }]
);
