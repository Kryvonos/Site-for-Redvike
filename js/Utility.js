;$(function() {
  var $window = $(window),
  
      breakpoints = {
          xs: 0,
          sm: 576,
          md: 768,
          lg: 992,
          xl: 1200
      },

      Utility = {

        isBreakpointUp: function isBreakpointUp(size) {
          var width = breakpoints[size];

          if ( isNumeric(size) ) {
            width = size;
          }
          else if ( ! breakpoints.hasOwnProperty(size) ) {
            return false;
          }

          return $window.outerWidth() >= width;
        },

        isBreakpointDown: function isBreakpointDown(size) {
          if ( size === null ) {
            return true;
          }

          var width = breakpoints[size];

          if ( Utility.isNumeric(size) ) {
            width = size;
          }
          else if ( ! breakpoints.hasOwnProperty(size) ) {
            return false;
          }

          return $window.outerWidth() < width;
        },

        isNumeric: function isNumeric(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }
      };

  window.Utility = Utility;
});
