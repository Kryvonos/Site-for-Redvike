;(function( $ ) {

  var contentClass = 'words-carousel-content',
      $self = null,
      $items = null;

  $.fn.wordsCarousel = function( options ) {
    $self = this;

    if ( options === undefined ) {
      var $first = this.children().first(),
          $last = this.children().last();

      // Dublicates first and last word
      $first.clone().appendTo( this );
      $last.clone().prependTo( this );

      // Create wrapper
      this.children().wrapAll( contentElementHtml );

      defineCarouselHeight();
      setInitialPosition();
    }
  };

  function setInitialPosition() {
    var top =  -carouselItems().first().outerHeight();

    $self.find('.words-carousel-content').css('transform', 'translateY(' + top + 'px)');
  }

  function defineCarouselHeight() {
    $self.css('height', carouselItemsMaxHeight() + 'px')
  }

  function carouselItemsMaxHeight() {
    var maxHeight = 0;

    carouselItems().each( function() {
      var $this = $(this);

      maxHeight = Math.max( maxHeight, $this.outerHeight() );
    } );

    return maxHeight;
  }

  function carouselItems() {
    return $self.find('.words-carousel-item');
  }

  function contentElementHtml() {
    return '<span class="' + contentClass + '"></span>';
  }

}( jQuery ));
