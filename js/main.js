'use strict';

if ( ! String.prototype.format ) {
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

;$(function( $ ) {
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

});



// Floating menu
;$(function() {
	var $header = $('#header'),
      $menuItems = $('[data-menu-item]'),
	    $floatingMenu = $('#floatingMenu'),
      $floatingMenuNav = $floatingMenu.find('.floating-menu-nav'),

	    controller = new ScrollMagic.Controller(),
	    scene = null,
	    needHideFloatingMenu = false;

  function init() {
    createFloatingMenuNav();
    initScene();
    initEventListeners();
  }

  function createFloatingMenuNav() {
    $menuItems.each( function() {
      var $this = $(this);
      $floatingMenuNav.append( floatingMenuItemHtml( $this.attr('href'), $this.text() ) );
    } );
  }

  function floatingMenuItemHtml(link, txt) {
    return '<a href="{0}" class="list-link">{1}</a>'.format(link, txt);
  }

  function initScene() {
    scene = new ScrollMagic.Scene({
        triggerElement: $('[data-show-floating-menu]'),
        triggerHook: 'onLeave',
        duration: 0,
      });

    scene.addTo( controller )
  	  .addIndicators();
  }

  function initEventListeners() {
    $floatingMenu.on('transitionend webkitTransitionEnd', onFloatingMenuTransitionEnd);
    scene.on('start', onSceneStart)
  }

	function onSceneStart( event ) {
	  var left = '',
	      indent = 30; // px

	  if ( event.scrollDirection === 'FORWARD' ) {
	    $floatingMenu.addClass('visible');
	    left = $header.offset().left;
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

  init();

});



// Floating nav
$( function() {

  var controller = new ScrollMagic.Controller(),
      scenes = [],
      timerId = null,
      triggerElementClass = '',

      $window = $(window),
      $floatingNav = null,
      $floatingMenu = $('#floatingMenu'),
      $elems = $('[data-floating-nav]');


  function init() {
    createFloatingNav();
    initEventListeners();
    initScenes();
    updateScenesTriggerHook();
  }

  function createFloatingNav() {
    $floatingNav = $('<div>', {id: 'floatingNav', class: 'floating-nav'});

    $elems.each( function() {
      var $this = $(this);

      $floatingNav.append( floatingNavItemHtml( $this.data('floatingNav') ) );
    } );

    $(document.body).append( $floatingNav );
  }

  function floatingNavItemHtml( txt ) {
    return '<div class="floating-nav-item" data-floating-nav-item="{0}"><span class="floating-nav-text">{0}</span></div>'.format( txt );
  }

  function initEventListeners() {
    $window.resize( updateScenesDuration );
  }

  function initScenes() {
    $elems.each( function() {
      var $this = $(this),
          scene = new ScrollMagic.Scene( {
            triggerElement: $this,
            triggerHook: .15,
            duration: $this.outerHeight()
          });

      scene.addTo( controller )
        .on('enter', onSceneEnter)
        .on('leave', onSceneLeave);
        // .addIndicators();

      scenes.push( scene );
    } );
  }

  function updateScenesDuration() {
      scenes.forEach( function( scene ) {
          var height = $( scene.triggerElement() ).outerHeight();

          scene.duration( height );
      } );
  }

  function updateScenesTriggerHook() {
      var $floatingNavItem = $floatingNav.find('.active'),
          windowHeight = $window.outerHeight(),
          top = 0,
          halfHeight = 0,
          triggerHook = 0;

      if ( ! $floatingNavItem.length ) {
        $floatingNavItem = $floatingNav.children().first();
      }

      top = $floatingNavItem.get(0).getBoundingClientRect().top,
      halfHeight = $floatingNavItem.outerHeight() / 2,
      triggerHook = (top + halfHeight) / windowHeight;

      scenes.forEach( function( scene ) {
          scene.triggerHook( triggerHook );
      } );
  }

  function onSceneEnter( event ) {
    var $triggerElement = $( event.target.triggerElement() ),
        section = $triggerElement.data('floatingNav'),
        $floatingNavItem = getFloatingNavItem( section );

    triggerElementClass = $triggerElement.data('floating-element-class');
    showFloatingNav();

    timerId = setTimeout( function() {
      timerId = null;

      $floatingMenu.addClass( triggerElementClass );
      $floatingNav.addClass( triggerElementClass );
      $floatingNavItem.addClass('active');

      updateScenesTriggerHook();
    }, 200 );
  }

  function getFloatingNavItem( section ) {
    return $floatingNav.find( '[data-floating-nav-item="{0}"]'.format( section ) )
  }

  function onSceneLeave( event ) {
    $floatingNav.find('.active').removeClass('active');
    $floatingNav.removeClass( triggerElementClass );
    $floatingMenu.removeClass( triggerElementClass );

    hideFloatingNav();

    clearTimeout( timerId );
  }

  function showFloatingNav() {
    $floatingNav.addClass('shown');
  }

  function hideFloatingNav() {
    $floatingNav.removeClass('shown');
  }

  init();

} );
