;(function( $ ) {

	function init() {
  		if ( ! Modernizr.flexbox ) {
  			window.location = "./browser-update.html";
  		}
	};

  init();

})( jQuery );
