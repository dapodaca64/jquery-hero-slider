$ = jQuery;

$.fn.heroSlider = function(){

  //if already constructed return API
  var slider = this.data("heroSlider");
  if (slider) { return slider; }

  return $(this).each(function(){

    var slider = new HeroSliderExampleA({ el: this });

    //expose the base object as an "API"
    $(this).data("heroSlider", slider);

  });

};

//DOM ready
$(function(){


  // Utilize Example A as a jQuery plug-in

  var heroA = $("#hero-slider-a").heroSlider();

  //enable JS console debugging of this "API" of the Hero instance
  window.heroSliderExampleA = $("#hero-slider-a").data("heroSlider");
  heroSliderExampleA.init();


  // Use Example A directly

  //var $aElement = $("#hero-slider-a");
  //window.heroSliderExampleA = new HeroSliderExampleA({ el: $aElement });
  //heroSliderExampleA.init();


  // Use Example B directly

  var $bElement = $("#hero-slider-b");
  window.heroSliderExampleB = new HeroSliderExampleB({ el: $bElement });
  heroSliderExampleB.init();


});
