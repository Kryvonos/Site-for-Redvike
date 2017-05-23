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

  function rebuild() {
    var $content = $elems.filter( '.' + contentClass ),
        index = $content.index();

    setContent( initialElement() );
    $wrapper.css({'height': '', "width": ''});
    createTimeline();
    setContent( $content );
    timeline.seek( 'label-' + index );
  }

  function createTimeline() {
      if ( ! $elems.length ) return;

      var $currentStartItem = null,
          $currentEndItem = null,
          onLabelCompleteDone = false;

      timeline = new TimelineMax({paused: true});
      // TimelineLite.ease = Power2.easeInOut;

      console.log('sdf');
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
  this.rebuild = rebuild;
}
