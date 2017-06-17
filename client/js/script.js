// script.js
var myApp = angular.module('webapp', ['ngRoute']);


myApp.config(function ($routeProvider, $sceDelegateProvider) {


});



myApp.controller('cntrl', function ($scope, $http, $interval, $timeout,$compile) {

    view = function (param) {
        console.log($(param).attr("nodeid"));

        var nodeId = $(param).attr("nodeid");

        emitMsg('node_event', {
            nodeId: '' + nodeId
        });

        // socket.emit('node_event', {
        //             nodeId: '' + $nodeId
        // });
    }




    $(".chat-btn").on("click", function (data) {
        console.log(data);
        view('test');
        
    });

    var socket = io.connect();

    emitMsg = function (event_name, event_data) {
        socket.emit(event_name, event_data);

    }

    socket.on('chat-resp', function (data) {
        console.log(data);

        var type = data["type"];
        if (type == 2) {
            // RESTAURANTS
            $scope.collections = data.output;
            $("#chatArea").append($compile("<collectionlist val='"+$scope.collections+"' />")($scope));
            var elem = document.getElementById('chatArea');
            $timeout( function(){
                elem.scrollTop = elem.scrollHeight;
            }, 1000 );
            
        } else if (type == 3) {
            //FOR NEWS
            $scope.news = data.output["articles"].slice(0, 4);;
            $("#chatArea").append($compile("<newslist val='"+$scope.news+"' />")($scope));
            var elem = document.getElementById('chatArea');
            $timeout( function(){
                elem.scrollTop = elem.scrollHeight;
            }, 1000 );
        } else if (type == 4) {
            //WEATHER
            console.log('weather: ', data);
            $scope.waetherHourlyList = data.output;
            $("#chatArea").append($compile("<weatherreport val='"+$scope.waetherHourlyList+"' />")($scope));
            var elem = document.getElementById('chatArea');
            $timeout( function(){
                elem.scrollTop = elem.scrollHeight;
            }, 1000 );
        } else if (type == 5) {
            // books
            console.log(data);
            $scope.booklist = data.output;
            $("#chatArea").append($compile("<booklist val='"+$scope.booklist+"' />")($scope));
            var elem = document.getElementById('chatArea');
            $timeout( function(){
                elem.scrollTop = elem.scrollHeight;
            }, 1000 );
           
        } else if (type == 6) {
            //ROutes
            console.log('train: ', data);
            $scope.routes = data.output;
            $("#chatArea").append($compile("<trainroutes val='"+$scope.routes+"' />")($scope));
            var elem = document.getElementById('chatArea');
            $timeout( function(){
                elem.scrollTop = elem.scrollHeight;
            }, 1000 );

        } else if (type == 7) {
            // comics
            console.log(data);
            $scope.comiclist = []; 
                $scope.comiclist[0] = data.output;
            $("#chatArea").append($compile("<comic val='"+$scope.comiclist+"' />")($scope));
            var elem = document.getElementById('chatArea');
            $timeout( function(){
                elem.scrollTop = elem.scrollHeight;
            }, 1000 ); 
           
        } else {
            console.log('data:', data);
            $scope.out = data.output;
            $("#chatArea").append($compile("<sample val='"+$scope.out+"' />")($scope));
            var elem = document.getElementById('chatArea');
            $timeout( function(){
                elem.scrollTop = elem.scrollHeight;
            }, 1000);
            // $("#chatArea").append("<div class='link_box' >Type @banker to start </div><br><br>");
            // $("#sendButton").click();
        }
        console.log(data["msg"]);



        // socket.emit('my other event', { my: 'data' });
    });

    $("#chatInput").focus();

    $("#sendButton").on("click", function () {

        // $("#chatArea").prepend("<div class='msgDiv' >"+$("#chatInput").val() + "</div><br><br>");
        socket.emit('chat', {
            msg: '' + $("#chatInput").val()
        });
        $("#chatArea").append("<div class='msgDiv'>" + $("#chatInput").val() + "</div><br><br>");
        var elem = document.getElementById('chatArea');
        elem.scrollTop = elem.scrollHeight;
        $("#chatInput").val("");
    });

    $("#chatInput").keypress(function (event) {

        var key = event.which;
        if (key == 13) {

            socket.emit('chat', {
                msg: '' + $("#chatInput").val()
            });
            $("#chatArea").append("<div class='msgDiv'>" + $("#chatInput").val() + "</div><br><br>");
            var elem = document.getElementById('chatArea');
            elem.scrollTop = elem.scrollHeight;
            $("#chatInput").val("");
        }
        //115
    });


});


myApp.directive('sample', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        templateUrl: 'html/sample.html',
        link: function (scope, elem, attrs) {
            // do stuff
            scope.tAttrs = attrs;
            
           

        }
    };


});

myApp.directive('collectionlist', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        templateUrl: 'html/collectionlist.html',
        link: function (scope, elem, attrs) {
            // do stuff
            scope.tAttrs = attrs;
        }
    };
});
myApp.directive('weatherreport', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        templateUrl: 'html/weather-report.html',
        link: function (scope, elem, attrs) {
            // do stuff
            scope.tAttrs = attrs;
        }
    };
});
myApp.directive('trainroutes', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        templateUrl: 'html/train-routes.html',
        link: function (scope, elem, attrs) {
            // do stuff
            scope.tAttrs = attrs;
        }
    };
});




myApp.directive('newslist', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        templateUrl: 'html/newslist.html',
        link: function (scope, elem, attrs) {
            // do stuff
            scope.tAttrs = attrs;
          

        }
    };


});

myApp.directive('booklist', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        templateUrl: 'html/booklist.html',
        link: function (scope, elem, attrs) {
            // do stuff
            scope.tAttrs = attrs;
          

        }
    };


});

myApp.directive('comic', function ($compile) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        templateUrl: 'html/comic.html',
        link: function (scope, elem, attrs) {
            // do stuff
            scope.tAttrs = attrs;
          

        }
    };


});