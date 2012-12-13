$ = jQuery;

$.fn.heroSlider = function(){

  //if already constructed return API
  var slider = this.data("heroSlider");
  if (slider) { return slider; }

  return $(this).each(function(){

    var slider = new HeroSliderBurrell({ el: this, autoRotate: false });

    //expose the base object as an "API"
    $(this).data("heroSlider", slider);

  });

};

//put our application under one global object
var app = { };

//DOM ready
$(function(){

  // Utilize Example A as a jQuery plug-in

  var hero = $("#hero-slider").heroSlider();

  //enable JS console debugging of this "API" of the Hero instance
  app.heroSlider = $("#hero-slider").data("heroSlider");
  app.heroSlider.init();

  //Filter Navigation
  app.filterNavigation = new FilterNavigation({
    el: $(".filter-modules-navigation")
  });

  app.pageNavigation = new PageNavigation();

  //Sticky Elements
  app.stickies = {
    navigation: new StickyElement({
      el: $(".filter-modules-sticky"),
      stickyOnScrollY: function(){
        return $("#hero-slider").height()
      },
      stickyScrollWidthLimit: 1024,
      stickyOnWidth: 1024,
      stickyWidthScrollLimit: function(){
        return $("#hero-slider").height()
      },
      stickyStyle: {
        position: "fixed",
      },
      unStickyStyle: {
        position: "relative",
      }
    }),
    ribbon: new StickyElement({
      el: $("#logo-ribbon-large"),
      stickyInput: "scroll",
      stickyOnScrollY: function(){
        return 0
      },
      stickyScrollWidthLimit: 1024,
      stickyOnWidth: 1024,
      stickyWidthScrollLimit: function(){
        return $("#hero-slider").height()
      },
      stickyStyle: {
        position: "fixed"
      },
      unStickyStyle: {
        position: "absolute"
      }
    })
  };

  //Add one router for the application
  app.router = new Workspace();

  //Kick off the Backbone.js routers
  Backbone.history.start();

  //Story Module
  app.storyModules = [ ];
  $(".module-culture").each(function(){
    var module = new StoryModule({ el: this });
    app.storyModules.push(module);
  });

});
