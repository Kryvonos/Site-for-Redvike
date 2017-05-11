'use strict';

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

;(function( $ ) {
	var $window = $(window),
			$header = $('#header'),
			$logo = $('#logo'),
			$logotype = $('#logotype'),
			$menuBurger = $('#menuBurger'),
			$menubar = $('#menubar'),

			menuBurgerClickTimeoutId = null,
			breakpoints = {
				  xs: 0,
				  sm: 576,
				  md: 768,
				  lg: 992,
				  xl: 1200
			};

	function init() {
  		if ( ! Modernizr.flexbox ) {
  			window.location = "./browser-update.html";
  		}

			initEventListeners();
			fitToViewportHeight();
	};

	function initEventListeners() {
		$(window).resize( onWindowResize );
		$menuBurger.click( onMenuBurgerClick );
		$logo.mouseenter( onLogoMouseEnter );
		$logo.on('transitionend webkitTransitionEnd', onLogoTransitionEnd);
	}

	function onWindowResize( event ) {
		fitToViewportHeight();
	}

	function onLogoMouseEnter( event ) {
		$logotype.removeClass('logo-logotype-hidden');
	}

	function onLogoTransitionEnd( event ) {
		if ( ! $logotype.hasClass('hidden') &&  $logotype.css('opacity') == 0 ) {
			$logotype.addClass('logo-logotype-hidden');
		}
	}

	function onMenuBurgerClick( event ) {
		var clickDelay = 700;

		if ( menuBurgerClickTimeoutId === null ) {

			if ( ! $menuBurger.hasClass('active') ) {
				$menuBurger.addClass('active');
				$menubar.addClass('active');
			}
			else {
				$menuBurger.addClass('closing');
				$menubar.addClass('closing');
			}

			menuBurgerClickTimeoutId = setTimeout( function() {
				menuBurgerClickTimeoutId = null;

				if ( $menuBurger.hasClass('closing') ) {
					$menuBurger.removeClass('active closing');
					$menubar.removeClass('active closing');
				}
			}, clickDelay );
		}
	}

	function fitToViewportHeight() {
		var $elems = $('[data-fit-to-viewport-height]'),
				height = $(window).outerHeight();

		$elems.each( function() {
			var $this = $(this),
					originalHeight = 0;

			$this.css('height', '');
			originalHeight = $this.outerHeight();

			if ( isBreakpointDown('lg') ) return;

			if ( originalHeight < height ) {
				$this.css('height', height + 'px');
			}
		} );
	}


	function isBreakpointUp(size) {
	  var width = breakpoints[size];

	  if ( isNumeric(size) ) {
	  	width = size;
	  }
	  else if ( ! breakpoints.hasOwnProperty(size) ) {
	  	return false;
	  }

	  return $window.outerWidth() >= width;
	}

	function isBreakpointDown(size) {
		if ( size === null ) {
	  	return true;
	  }

	  var width = breakpoints[size];

	  if ( isNumeric(size) ) {
	  	width = size;
	  }
	  else if ( ! breakpoints.hasOwnProperty(size) ) {
	  	return false;
	  }

	  return $window.outerWidth() < width;
	}

	function isNumeric(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}


  init();

})( jQuery );



// Floating menuBurger
;(function() {
  return;
	var $mainContainerWrapper = $('#mainContainerWrapper'),
	    $floatingMenu = $('#floatingMenu'),

	    controller = new ScrollMagic.Controller(),
	    scene = new ScrollMagic.Scene({
	      triggerElement: $('[data-show-floating-menu]'),
	      triggerHook: 'onLeave',
	      duration: 0,
	    }),
	    needHideFloatingMenu = false;

	$floatingMenu.on('transitionend webkitTransitionEnd', onFloatingMenuTransitionEnd);
	scene
	  .on('start', onSceneStart)
	  .addIndicators()
	  .addTo( controller );

	function onSceneStart( event ) {
	  var left = '',
	      indent = 30; // px

	  if ( event.scrollDirection === 'FORWARD' ) {
	    $floatingMenu.addClass('visible');
	    left = $mainContainerWrapper.offset().left;
	    left += indent;

	    $floatingMenu.css('left', left);
	  }
	  else {
	    $floatingMenu.removeClass('visible');
	  }
	}

	function onFloatingMenuTransitionEnd( event ) {
	  if ( ! $floatingMenu.hasClass('visible') && $floatingMenu.css('opacity') == 0 ) {
	    $floatingMenu.css('left', '');
	  }
	}

}());
