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
      $html = $('html'),
      $fitToViewportHeight = $('[data-fit-to-viewport-height]');

	function init() {
  		if ( ! Modernizr.flexbox ) {
  			window.location = "./browser-update.html";
  		}

			initEventListeners();
			// defineFitToViewportHeight();
	};

	function initEventListeners() {
		$window.resize( onWindowResize );
    $('a[href*="#"]').click( onAnchorLinkClick );
	}

	function onWindowResize( event ) {
		defineFitToViewportHeight();
	}

  function onAnchorLinkClick( event ) {
      var $anchor = $( event.target ).closest('a');

      if ( $anchor.attr('href') === '#' || $anchor.attr('href') === '#0' ) return;

      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
        &&
        location.hostname == this.hostname
      ) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

            // Does a scroll target exist?
            if ( target.length ) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();

                $('html, body').animate({
                  scrollTop: target.offset().top
                }, 1000);
            }
        }
  }


	function defineFitToViewportHeight( $elem ) {
  		var height = $window.outerHeight(),
          $elems = ( $elem === undefined ? $fitToViewportHeight : $elem );

  		$fitToViewportHeight.each( function() {
    			var $this = $(this),
              originalHeight = 0;

    			$this.css('height', '');
    			originalHeight = $this.outerHeight();

    			if ( Utility.isBreakpointDown('lg') ) return;

    			if ( originalHeight < height ) {
    				$this.css('height', height + 'px');
    			}
  		} );
	}


  init();

});



// Header
;$(function() {

  var $html = $('html'),
      $header = $('#header'),
      $logo = $('#logo'),
      $logotype = $('#logotype'),
      $menuBurger = $('#menuBurger'),
  		$menubar = $('#menubar'),

      menuBurgerClickTimeoutId = null;

  function init() {
    initEventListeners();
  }

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
		var clickDelay = 700;

		if ( menuBurgerClickTimeoutId === null ) {

			if ( ! $menuBurger.hasClass('active') ) {
        scrollToPageTop( function() {
          $html.addClass('no-scrolling');
        } );

				$menuBurger.addClass('active');
				$menubar.addClass('active');
        $html.addClass('no-scrolling');
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
          $html.removeClass('no-scrolling');
				}
			}, clickDelay );
		}
	}

  function scrollToPageTop( callback ) {
    $('html, body').animate( { scrollTop: 0 }, 200, callback);
  }

  init();

});


// Floating menu
;$(function() {
  return;
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

    scene.addTo( controller );
  	  // .addIndicators();
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

  // init();

});


// Floating nav
$( function() {
  return;
  var controller = new ScrollMagic.Controller(),
      scenes = [],
      timerId = null,
      triggerElementClass = '',

      $window = $(window),
      $floatingNav = null,
      $floatingMenu = $('#floatingMenu'),
      $navMarker = null,
      $navMarkerContainer = $('[data-append-floating-nav-marker]'),
      $elems = $('[data-floating-nav]');


  function init() {
    createFloatingNav();
    createFloatingNavMaker();
    initScenes();

    function updateScenesFewTimes( stamp ) {
      if ( stamp > 10000 ) return;

      updateScenes();
      window.requestAnimationFrame( updateScenesFewTimes );
    }

    updateScenesFewTimes();
    initEventListeners();
  }

  function updateScenes() {
    updateScenesDuration();
    updateScenesTriggerHook();
  }

  function initScenes() {
    $elems.each( function() {
      var $this = $(this),
          scene = new ScrollMagic.Scene( {
            triggerElement: $this,
            triggerHook: .15,
            duration: $this.outerHeight()
          });

      scene.addTo( controller );
        // .addIndicators();

      scenes.push( scene );
    } );
  }

  function initEventListeners() {
    $navMarker.on('click', onNavMarkerClick);
    // new ResizeSensor($elems, updateScenesDuration);

    scenes.forEach( function( scene ) {
        scene.on('enter', onSceneEnter)
             .on('leave', onSceneLeave);
    } );
  }

  function updateScenes() {
    updateScenesDuration();
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

  function createFloatingNavMaker() {
    var markerTxt = $elems.first().data('floatingNav');
    $navMarker = $( $.parseHTML( floatigNavMarkerHtml( markerTxt ) ) );

    $navMarkerContainer.append( $navMarker );
  }

  function onNavMarkerClick( event ) {
    var top = $elems.offset().top;

    $('html, body').animate( {scrollTop: top}, 500 );
  }

  function floatingNavItemHtml( txt ) {
    return '<div class="floating-nav-item" data-floating-nav-item="{0}"><span class="floating-nav-text">{0}</span></div>'.format( txt );
  }

  function floatigNavMarkerHtml( txt ) {
    return '<span class="nav-marker">{0}</span>'.format( txt );
  }

  function updateScenesDuration() {
      scenes.forEach( updateSceneDuration );
  }

  function updateSceneDuration( scene ) {
    var $triggerElement = $( scene.triggerElement() ),
        height = $triggerElement.outerHeight();

    scene.duration( height );
  }

  function getSceneByTriggerElement( triggerElement ) {
    var res = null;

    scenes.forEach( function( scene ) {
        if ( scene.triggerElement() === triggerElement ) {
          res = scene;
          return
        }
    } );

    return res;
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

  function onContentChange( event ) {
    updateSceneDuration( getSceneByTriggerElement( event.target ) );
  }


  function showFloatingNav() {
    $floatingNav.addClass('shown');
  }

  function hideFloatingNav() {
    $floatingNav.removeClass('shown');
  }

  init();

} );


// Contacts form scenario
;$( function() {
  return;
  var scenario = null,

      $window = $(window),
      $body = $('body'),
      $contacts = $('#contacts'),
      $contactsForm = $('#contactsForm'),
      $selectProduct = $('[data-select-product]'),

      formHasBeenSubmitted = false,
      manuallyRestoredValue = {};

  function init() {
    scenario = defineScenario( 'default' );

    initEventListeners();
  }

  function initEventListeners() {
    $selectProduct.click( onSelectProductClick );
    $body.on('contacts-input:blur', onContactsInputBlur);
  }

  function onSelectProductClick( event ) {
    var $target = $( event.target ),
        productType = $target.data('selectProduct');

    scenario = defineScenario( 'product-selected' );

    clearContacts();
    scenario.restoreValue( 'product-type', productType );
    scenario.showNextItem();
    scenario.showNextItem();

    Utility.scrollTo( $contacts );
  }

  function onContactsInputBlur( event ) {
    var $target = $( event.target ),
        $scenarioItem = $target.closest('[data-scenario]');

    scenario.showNextItem( $scenarioItem );

    if ( ! scenario.hasMoreItemsToShow() && scenario.isValidItems() && ! formHasBeenSubmitted ) {
      submitForm();
    }
  }


  function defineScenario( name ) {
      var $scenario = findScenario( name ),
          shownClass = 'contacts-group-shown';


      function showNextItem( $elem ) {
          var $scenarioItem = null;

          if ( ! $elem ) {
            $elem = $scenario.filter( '.{0}:last'.format( shownClass ) );
          }

          if ( $elem.length ) {
            $scenarioItem = getNextScenarioItem( $elem );
          } else {
            $scenarioItem = $scenario.first();
          }

          // 1. Restore values
          restoreValues();

          // 2. Validating all the input fields
          if ( ! validateShownItems() ) return;
          if ( $scenarioItem.hasClass( shownClass) ) return;

          $scenarioItem.addClass( shownClass );
      }

      function getNextScenarioItem( $elem ) {
        var index = Number.POSITIVE_INFINITY,
        counter = 0;

        $scenario.each( function() {
          var $this = $(this);
          counter++;

          if ( $this.is( $elem ) ) {
            index = counter;
            return;
          }

        } );

        return $scenario.eq( index );
      }

      function hasMoreItemsToShow() {
        return $scenario.filter( ':not(.{0})'.format( shownClass ) ).length != 0;
      }


      function validateShownItems() {
          var $elems = $scenario.filter( '.' + shownClass ),
              isValid = true;

          $elems.find('.contacts-input-shown-error').removeClass('contacts-input-shown-error');
          $elems.each( function() {
              var $this = $(this),
                  $input = $this.find('[data-validation]'),
                  validationFuncName = $input.data('validation'),
                  validationFunc = null,
                  validationRes = null;

              if ( ! validationFuncName ) return;

              validationFunc = Utility[validationFuncName];
              validationRes = validationFunc( $input.val() );
              isValid = ( validationRes === 'ok' );

              if ( ! isValid ) {
                var $inputError = $input.siblings('.contacts-input-error');

                $inputError.parent().addClass('contacts-input-shown-error');
                $inputError.text( validationRes );
              }
          } );

          return isValid;
      }

      function isValidItems() {
          var $elems = $scenario.filter( '.' + shownClass ),
              isValid = true;

          $elems.each( function() {
              var $this = $(this),
                  $input = $this.find('[data-validation]'),
                  validationFuncName = $input.data('validation'),
                  validationFunc = null,
                  validationRes = null;

              if ( ! validationFuncName ) return;

              validationFunc = Utility[validationFuncName];
              validationRes = validationFunc( $input.val() );
              isValid = ( validationRes === 'ok' );

              return isValid;
          } );

          return isValid;
      }


      return {
        showNextItem: showNextItem,
        restoreValue: restoreValue,
        hasMoreItemsToShow: hasMoreItemsToShow,
        isValidItems: isValidItems,
      }
  }

  function findScenario( name ) {
    var $elems = $('[data-scenario]');

    return $elems.filter( function() {

      return belongsToScenario( $(this), name );

    } );
  }

  function restoreValues() {
      var $elems = $('[data-restore-value]');

      $elems.each( function() {
          var $this = $(this),
              valueToRestore = $this.data('restoreValue'),
              $elem = $( '[data-contacts-value="{0}"]'.format( valueToRestore ) ),
              val = manuallyRestoredValue[valueToRestore] || $elem.val();

          $this.text( val );
      } );
  }

  function restoreValue( value, data ) {
    var $elems = $( '[data-restore-value="{0}"]'.format( value ) );

    manuallyRestoredValue[value] = data;
    $elems.text( data );
  }

  function belongsToScenario( $elem, name ) {
    var scenarios = null;

    $elem = $elem.first();
    scenarios = $elem.data('scenario').split(' ');

    for (var i = 0; i < scenarios.length; ++i) {
        if ( scenarios[i] === name ) {
          return true;
        }
    }

    return false;
  }


  function clearContacts() {
    $('.contacts-group-shown').removeClass( 'contacts-group-shown' );
  }


  function submitForm() {
      var $name = $contactsForm.find('input[name=name]'),
          $email = $contactsForm.find('input[name=email]'),
          $selectedProduct = $contactsForm.find('input[name="selected-product"]'),
          $represent = $contactsForm.find('input[name=represent]'),
          $deadline = $contactsForm.find('input[name=deadline]'),
          $fail = $('#formSubmitFail'),
          $ok = $('#formSubmitOk');

      $.post( $contactsForm.attr('action'), {
        name: $name.val(),
        email: $email.val(),
        selectedProduct: $selectedProduct.val(),
        represent: $represent.val(),
        deadline: $deadline.val(),
      } )
      .done( function( response ) {

        if ( response == 1 ) {
          formHasBeenSubmitted = true;
          $ok.removeClass('hidden-xs-up');
        }
        else {
          $fail.removeClass('hidden-xs-up');
        }

        console.log( response );
      } );
  }

  init();

} );


;$( function() {
  var animationFlows = null;

  function init() {
    animationFlows = createAnimationFlows();

    initAnimationFlow();
    initEventListeners();

    setTimeout(function() {
      // createAnimationFlowTimeline( 'section-subheading' );
      createAnimationFlowTimeline( 'section-text' );
    }, 500);
  }

  function createAnimationFlows() {
      var obj = {},
          $elems = $('[data-animation-flow]');

      $elems.each( createOneFlow );

      function createOneFlow() {
        var $this = $(this),
            flow = $this.data('animation-flow');

        if ( ! obj.hasOwnProperty( flow ) ) {
          obj[flow] = [];
        }

        obj[flow].push( $this );
      }

      return obj;
  }

  function initAnimationFlow() {

      for (var key in animationFlows) {
        createAndFillAnimationFlowWrapper( animationFlows[key] );
      }

      function createAndFillAnimationFlowWrapper( animationFlow ) {
          if ( ! animationFlow.length ) return;

          var $firstItem = animationFlow[0],
              $wrapper = null,
              items = null;

          // creating wrapper
          $firstItem.wrap('<div class="animation-flow-wrapper"></div>');
          $firstItem.addClass('animation-flow-content');

          $wrapper = $firstItem.parent();
          items = animationFlow.slice( 1 );
          // Filling up the wrapper
          $wrapper.append( items );

          for (var i = 0; i < items.length; ++i) {
            items[i].addClass('animation-flow-item');
          }
      }
  }

  function initEventListeners() {}

  function createAnimationFlowTimeline( flowName ) {
    if ( ! animationFlows[ flowName ] || ! animationFlows[ flowName ].length ) return;

    var flow = animationFlows[ flowName ],
        $wrapper = flow[0].parent(),
        timeline = new TimelineMax({paused: true});

    var $startElement = null,
        $endElement = null;

    for (var i = 0; i < flow.length - 1; ++i) {
        var $startItem = flow[i],
            $endItem = flow[i + 1],
            wrapperWidth = 0,
            wrapperHeight = 0,
            startItemLabel = 'startItem' + i;

        $wrapper.children().removeClass('animation-flow-content').addClass('animation-flow-item');

        $startItem.removeClass('animation-flow-content').addClass('animation-flow-item');
        $endItem.removeClass('animation-flow-item').addClass('animation-flow-content');

        wrapperWidth = $wrapper.outerWidth();
        wrapperHeight = $wrapper.outerHeight();


        $startItem.removeClass('animation-flow-item').addClass('animation-flow-content');
        $endItem.removeClass('animation-flow-content').addClass('animation-flow-item');

        timeline.to($startItem, .7, {y: -100, opacity: 0, onComplete: updateStartElement}, startItemLabel)
          .set($endItem, {y: 0}, startItemLabel)
          .fromTo($endItem, .7, {y: 100, opacity: 0}, {y: 0, opacity: 1, onComplete: updateEndElement}, startItemLabel + '+=.2')
          .to($wrapper, .9, {width: wrapperWidth, height: wrapperHeight}, startItemLabel)
          .add('label' + i)
          .addCallback(onLabelComplete)
          ;
    }

    $wrapper.children().removeClass('animation-flow-content').addClass('animation-flow-item');
    $wrapper.children().first().removeClass('animation-flow-item').addClass('animation-flow-content');

    timeline.seek('label0');
    timeline.reverse('label0');

    function updateStartElement() {
      console.log('start');
      $startElement = $(this.target);
    }

    function updateEndElement() {
      console.log('end');
      $endElement = $(this.target);
    }

    function onLabelComplete() {
      console.log('onLabelComplete');
      $startElement.removeClass('animation-flow-content').addClass('animation-flow-item');
      $endElement.removeClass('animation-flow-item').addClass('animation-flow-content');
      $wrapper.css({width: '', height: ''});
    }
  }

  init();

} );

// function AnimationFlow( flowName ) {
//   var $wrapper = null;
//
//   function init() {
//     createWrapper();
//     fillWrapper();
//   }
//
//   function createWrapper() {
//
//   }
//
//   function fillWrapper() {
//
//   }
//
//   init();
//
//   // this.
// }
