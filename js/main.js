'use strict';

;(function( $ ) {
	var $header = $('#header'),
			$logo = $('#logo'),
			$logotype = $('#logotype'),
			$menuBurger = $('#menuBurger'),
			$menubar = $('#menubar'),
			menuBurgerClickTimeoutId = null;

	function init() {
  		if ( ! Modernizr.flexbox ) {
  			window.location = "./browser-update.html";
  		}

			initEventListeners();
	};

	function initEventListeners() {
		$menuBurger.click( onMenuBurgerClick );
		$logo.mouseenter( onLogoMouseEnter );
		$logo.on('transitionend webkitTransitionEnd', onLogoTransitionEnd);
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
		var clickDelay = 400;

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

  init();

})( jQuery );
