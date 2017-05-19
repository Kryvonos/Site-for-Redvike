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
        },

        scrollTo: function scrollTo( $elem ) {
          $('html, body').animate( {scrollTop: $elem.offset().top}, 600 );
        },

        stringValidation: function stringValidation( txt ) {
            var isValid = txt.length > 1;

            if ( isValid ) {
              return 'ok';
            }
            else {
              return 'This field can\'t be empty';
            }
        },

        nameValidation: function nameValidation( name ) {
            var isValid = name.length > 1 && ! name.match( /\d+/g );

            if ( isValid ) {
              return 'ok';
            }
            else {
              return 'Incorrect name type';
            }
        },

        emailValidation: function emailValidation( email ) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if ( re.test( email ) ) {
              return 'ok'
            }
            else {
              return 'Incorrect email type';
            }
        }
      };

  window.Utility = Utility;
});
