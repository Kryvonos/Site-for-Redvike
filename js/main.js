'use strict';

;(function( $ ) {
	var $menuBurger = $('#menuBurger'),
			menuBurgerClickTimeoutId = null;

	function init() {
  		if ( ! Modernizr.flexbox ) {
  			window.location = "./browser-update.html";
  		}

			initEventListeners();
	};

	function initEventListeners() {
		$menuBurger.click( onMenuBurgerClick );
	}

	function onMenuBurgerClick( event ) {
		var clickDelay = 500;

		if ( menuBurgerClickTimeoutId === null ) {

			if ( ! $menuBurger.hasClass('active') ) {
				$menuBurger.addClass('active');
			}
			else {
				$menuBurger.addClass('closing');
			}

			menuBurgerClickTimeoutId = setTimeout( function() {
				menuBurgerClickTimeoutId = null;

				if ( $menuBurger.hasClass('closing') ) {
					$menuBurger.removeClass('active closing');
				}
			}, clickDelay );
		}
	}

  init();

})( jQuery );
