app.run([
  function() {
    /**
     * Cause a full page load on every route change.
     */
    $rootScope.$on('$locationChangeStart', function($event, changeTo, changeFrom) {
      if (changeTo == changeFrom) {
        return;
      }
 
      window.location.assign(changeTo);
      window.location.reload(true);
    });
}]);
