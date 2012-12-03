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

  var hero = $("#hero-slider").heroSlider();

  //enable JS console debugging of this "API" of the Hero instance
  window.heroSlider = $("#hero-slider").data("heroSlider");
  heroSlider.init();


});
