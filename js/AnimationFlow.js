function AnimationFlow( options ) {


  options = $.extend( {
    name: 'default',
    wrapperClass: '',
    loop: false,
    duration: .6,
    delay: 0,
    y: 50
  }, options );


  var $window = $(window),
      $wrapper = null,
      $elems = null;

  var timeline = null;

  var wrapperClass = 'animation-flow-wrapper',
      contentClass = 'animation-flow-content',
      itemClass = 'animation-flow-item',
      inlineBlockClass = 'animation-flow-d-inline-block';

  function init() {
    timeline = new TimelineMax({paused: true})

    initAnimationFlowElems();
    createWrapper();
    fillWrapper();
  }

  function initAnimationFlowElems() {
      var $originalElems = $( '[data-animation-flow="{0}"]'.format( options.name ) );

      $elems = $originalElems.map( function(index) {
        if ( index === 0 ) return this;

        return this.cloneNode(true);
      } );
  }

  function createWrapper() {
      if ( ! $elems.length ) return;
      var displayClass = '',
          display = initialElement().css('display');

      if ( display === 'inline' || display === 'inline-block' ) {
        displayClass = inlineBlockClass;
      }

      initialElement().wrap( '<div class="{0} {1} {2}"></div>'.format( wrapperClass, displayClass, options.wrapperClass ) );
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

  function contentElement() {
    return $elems.filter( '.' + contentClass );
  }

  function setContent( $item ) {
      resetElemsClass();
      $elems.not( $item ).addClass( itemClass );
      $item.addClass( contentClass );
  }

  function resetElemsClass() {
    $elems.removeClass( contentClass ).removeClass( itemClass );
  }

  function animate($startItem, $endItem, playReverse) {
    if ( ! $elems.length ) return;

    var wrapperWidth = null,
        wrapperHeight = null,
        duration = options.duration,
        delay = options.delay;

    setContent( $endItem );
    wrapperWidth = $wrapper.outerWidth();
    wrapperHeight = $wrapper.outerHeight();
    setContent( $startItem );

    timeline = new TimelineMax({paused: true});

    timeline
      .fromTo($startItem, duration, {y: 0}, {y: -options.y, ease: Power2.easeInOut}, 'startItem')
      .set($startItem, {y: 0})
      .fromTo($startItem, duration - delay, {opacity: 1}, {opacity: 0, ease: Power2.easeInOut}, 'startItem+=' + delay)
      .fromTo($endItem, duration, {y: options.y}, {y: 0, ease: Power2.easeInOut}, 'startItem')
      .fromTo($endItem, duration - delay, {opacity: 0}, {opacity: 1, ease: Power2.easeInOut}, 'startItem+=' + delay)
      .to($wrapper, duration, {width: wrapperWidth, height: wrapperHeight, ease: Power2.easeInOut}, 'startItem')
      .eventCallback('onReverseComplete', onLabelComplete, ['REVERSE'])
      .eventCallback('onComplete', onLabelComplete, ['FORWARD'])
    ;

    if ( playReverse === true ) {
      timeline.reverse(0);
    } else {
      timeline.play();
    }

    function onLabelComplete( arg ) {

        if ( playReverse ) {
          setContent( $startItem );
        } else {
          setContent( $endItem );
        }

        window.requestAnimationFrame( function() {
          $wrapper.css({width: '', height: ''});
        } );
    }
  }


  function reset() {
    $elems.css('opacity', '');
    setContent( initialElement() );
  }

  function next() {
    if ( ! options.loop && ! hasNext() ) return;
    if ( timeline.isActive() ) return;

    var $content = contentElement(),
        $next = $content.next();

    if ( ! $next.length  ) {
      $next = $elems.first();
    }

    animate( $content, $next );
  }

  function prev() {
    if ( ! options.loop && ! hasPrev() ) return;
    if ( timeline.isActive() ) return false;

    var $content = contentElement();

    animate( $content.prev(), $content, true );
  }


  function hasNext() {
    var $next = contentElement().next();

    return $next.length != 0;
  }

  function hasPrev() {
    var $prev = contentElement().prev();

    return $prev.length != 0;
  }


  init();

  this.reset = reset;
  this.next = next;
  this.prev = prev;
  this.hasNext = hasNext;
  this.hasPrev = hasPrev;
}
