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
			defineFitToViewportHeight();
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
        $floatingNavItem = getFloatingNavItem( section ),

        prevTriggerElementClass = triggerElementClass;

    triggerElementClass = $triggerElement.data('floating-element-class');
    showFloatingNav();

    timerId = setTimeout( function() {
      timerId = null;

      $floatingMenu.removeClass( prevTriggerElementClass );
      $floatingNav.removeClass( prevTriggerElementClass );
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
    var $nextItem = getNextItem();

    $floatingNav.find('.active').removeClass('active');

    // We remove triggerElementClass only if there is no more nav items
    if ( ! $nextItem.length ) {
      $floatingNav.removeClass( triggerElementClass );
      $floatingMenu.removeClass( triggerElementClass );
    }

    hideFloatingNav();
    clearTimeout( timerId );
  }

  function getNextItem() {
    return $floatingNav.find('.active').next('.floating-nav-item');
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
  // return;
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


function AnimationFlow( flowName ) {
  var timeline = null,
      $wrapper = null,
      $elems = null,

      wrapperClass = 'animation-flow-wrapper',
      contentClass = 'animation-flow-content',
      itemClass = 'animation-flow-item',
      inlineBlockClass = 'animation-flow-d-inline-block',

      currentTimelineLabel = '',

      labels = {};

  function init() {
    initAnimationFlowElems();
    createWrapper();
    fillWrapper();
    createTimeline();
  }

  function initAnimationFlowElems() {
      $elems = $( '[data-animation-flow="{0}"]'.format( flowName ) );
  }

  function createWrapper() {
      if ( ! $elems.length ) return;
      var displayClass = '',
          display = initialElement().css('display');

      if ( display === 'inline' || display === 'inline-block' ) {
        displayClass = inlineBlockClass;
      }

      initialElement().wrap( '<div class="{0} {1}"></div>'.format( wrapperClass, displayClass ) );
      $wrapper = initialElement().parent();
  }

  function fillWrapper() {
      var $items = $( $elems.toArray().slice(1) );

      initialElement().addClass( contentClass );
      $items.addClass( itemClass );
      $wrapper.append( $items );
  }

  function initialElement() {
      return $elems.first();
  }

  function setContent( $item ) {
      resetElemsClass();
      $elems.not( $item ).addClass( itemClass );
      $item.addClass( contentClass );
  }

  function resetElemsClass() {
    $elems.removeClass( contentClass ).removeClass( itemClass );
  }

  function createTimeline() {
      if ( ! $elems.length ) return;

      var $currentStartItem = null,
          $currentEndItem = null,
          onLabelCompleteDone = false;

      timeline = new TimelineMax({paused: true});
      // TimelineLite.ease = Power2.easeInOut;

      for (var i = 0; i < $elems.length - 1; ++i) {
          var $startItem = $elems.eq(i),
              $endItem = $elems.eq(i + 1),
              wrapperWidth = 0,
              wrapperHeight = 0,
              startItemLabel = 'startItem' + i;

          setContent( $endItem );
          wrapperWidth = $wrapper.outerWidth();
          wrapperHeight = $wrapper.outerHeight();
          setContent( $startItem );

          timeline
            .to($startItem, .7, {y: -50, onComplete: updateCurrentStartItem, onReverseComplete: updateCurrentStartItem, onReverseCompleteParams: [true], ease: Power2.easeInOut}, startItemLabel)
            .fromTo($startItem, .5, {opacity: 1}, {opacity: 0, delay: .2, ease: Power2.easeInOut}, startItemLabel)
            .set($endItem, {y: 0}, startItemLabel)
            .fromTo($endItem, .7, {y: 50}, {y: 0, onComplete: updateCurrentEndItem, onReverseComplete: updateCurrentEndItem, onReverseCompleteParams: [true], ease: Power2.easeInOut}, startItemLabel)
            .fromTo($endItem, .5, {opacity: 0}, {opacity: 1, delay: .2, ease: Power2.easeInOut}, startItemLabel)
            .to($wrapper, .9, {width: wrapperWidth, height: wrapperHeight, ease: Power2.easeInOut}, startItemLabel)
            .eventCallback('onReverseComplete', onLabelComplete)
            .addCallback( onLabelComplete )
            .add('label-' + (i + 1))
      }

      currentTimelineLabel = 0;
      setContent( initialElement() );

      function updateCurrentStartItem( isReversed ) {
          if ( isReversed )
            $currentEndItem = $(this.target);
          else
            $currentStartItem = $(this.target);
      }

      function updateCurrentEndItem( isReversed ) {
          if ( isReversed )
            $currentStartItem = $(this.target);
          else
            $currentEndItem = $(this.target);
      }

      function onLabelComplete() {
          if ( ! $currentStartItem || ! $currentEndItem ) return;

          setContent( $currentEndItem );

          window.requestAnimationFrame( function() {
            $wrapper.css({width: '', height: ''});
          } );
      }
  }

  function next() {
    var nextLabel = getNextLabel( currentTimelineLabel );

    if ( ! nextLabel ) return;

    timeline.tweenFromTo(currentTimelineLabel, nextLabel);
    currentTimelineLabel = nextLabel;
  }

  function prev() {
    var prevLabel = getPreviousLabel( currentTimelineLabel );

    if ( prevLabel === null || prevLabel === undefined ) return;

    timeline.tweenFromTo(currentTimelineLabel, prevLabel);
    currentTimelineLabel = prevLabel;
  }

  function getNextLabel( label ) {
    if ( label === 0 ) return 'label-1';

    var nextLabel = null,
      labels = timeline.getLabelsArray(),
      labelName = getLabelName( label ),
      labelIndex = getLabelIndex( label );

    if ( labelIndex === -1 ) return;

    labels.forEach( function( currLabelObj ) {
        var currLabel = currLabelObj.name,
            currLabelName = getLabelName( currLabel ),
            currLabelIndex = getLabelIndex( currLabel );

        if ( currLabelIndex === -1 ) return;
        if ( currLabelName !== labelName ) return;
        if ( currLabelIndex !== labelIndex + 1) return;

        nextLabel = currLabelObj.name;
    } );

    return nextLabel;
  }

  function getPreviousLabel( label ) {
    if ( label === 0 ) return null;
    if ( label === 'label-1' ) return 0;

    var prevLabel = null,
      labels = timeline.getLabelsArray(),
      labelName = getLabelName( label ),
      labelIndex = getLabelIndex( label );

    if ( labelIndex === -1 ) return;

    labels.forEach( function( currLabelObj ) {
        var currLabel = currLabelObj.name,
            currLabelName = getLabelName( currLabel ),
            currLabelIndex = getLabelIndex( currLabel );

        if ( currLabelIndex === -1 ) return;
        if ( currLabelName !== labelName ) return;
        if ( currLabelIndex !== labelIndex - 1) return;

        prevLabel = currLabel;
    } );

    return prevLabel;
  }

  function getLabelName( label ) {
    var labelSplit = label.split('-'),
        res = labelSplit[0];

    if ( labelSplit.length !== 1 ) {
      res = labelSplit.slice(0, -1).join('-');
    }

    return res;
  }

  function getLabelIndex( label ) {
    var labelSplit = label.split('-'),
        res = -1;

    if ( labelSplit.length !== 1 ) {
      res = Number.parseInt( labelSplit[ labelSplit.length - 1 ] );
    }

    return res;
  }


  function hasNext() {
    var next = getNextLabel( currentTimelineLabel );

    return next !== null && next !== undefined;
  }

  function hasPrev() {
    var prev = getPreviousLabel( currentTimelineLabel );

    return prev !== null && prev !== undefined;
  }


  init();

  this.next = next;
  this.prev = prev;
  this.hasNext = hasNext;
  this.hasPrev = hasPrev;
  // this.rebuild = reduild();
}

;$( function() {
  return;
  var sectionDescriptionFlow = new AnimationFlow( 'section-description' ),
      sectionHeadingWordFlow = new AnimationFlow( 'section-heading-word' );

  window.sectionDescriptionFlow = sectionDescriptionFlow;
  window.sectionHeadingWordFlow = sectionHeadingWordFlow;
  // $('#serviceSection').click( function() {
  //   sectionDescriptionFlow.next();
  //   sectionHeadingWordFlow.next();
  // } );
  //
  // $('#startSection').click( function() {
  //   sectionDescriptionFlow.prev();
  //   sectionHeadingWordFlow.prev();
  // } );

} );
