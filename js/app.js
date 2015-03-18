angular.module('App', ['duScroll']).
  controller('AppCtrl', function($scope, $document){
    $document.on('scroll', function() {
      // console.log('Document scrolled to ', $document.scrollTop());
    });
    var container = angular.element(document.getElementById('container'));
    container.on('scroll', function() {
      // console.log('Container scrolled to ', container.scrollLeft(), container.scrollTop());
    });
  }
).value('duScrollOffset', 0);
