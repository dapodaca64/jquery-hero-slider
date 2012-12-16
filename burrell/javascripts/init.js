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

  //Story Module
  app.storyModules = [ ];

  //Workhorse function to stay DRY
  var createStoryModule = function(moduleOpts, el) {

    // New instance of StoryModule
    var module = new StoryModule(moduleOpts);

    // Add to the JS application layer
    app.storyModules.push(module);

    // Add the StoryModule instance to the DOM to serve as an API
    $(el).data("storyModule", module);

  };

  $(".module-culture").each(function(){
    var moduleOptions = {
      el: this,
      animatedElementSelectors: [
        { fadeIn: ".module-background .active" },
        { fadeIn: ".module-title.active", fadeOut: ".module-title.default" }
      ]
    };
    createStoryModule(moduleOptions, this);
  });
  $(".module-case-study").each(function(){
    var moduleOptions = {
      el: this,
      animatedElementSelectors: [
        { fadeIn: ".module-background .active"},
        { fadeIn: ".module-title.active" }
      ]
    };
    createStoryModule(moduleOptions, this);
  });
  $(".module-results").each(function(){
    var moduleOptions = {
      el: this,
      animatedElementSelectors: [
        { fadeIn: ".data .active" }
      ]
    };
    createStoryModule(moduleOptions, this);
  });
  $(".module-supplement").each(function(){
    var moduleOptions = {
      el: this,
      animatedElementSelectors: [
        { fadeIn: ".active" }
      ]
    };
    createStoryModule(moduleOptions, this);
  });

  //Handle character logos separately from the story modules
  $(".module-navigation .tab").each(function(){
    var moduleOptions = {
      el: this,
      animatedElementSelectors: [
        { fadeIn: ".active" }
      ]
    };
    createStoryModule(moduleOptions, this);
    //var module = new StoryModule(moduleOptions);
    //$(this).data("storyModule", module);
  });

  //Clients Panel
  app.clientsPanel = new ClientsPanel({
    el: $(".clients-module")
  });

  //Page Navigation
  // does work on Story Modules
  // therefore include AFTER Story Modules
  // have been created
  app.pageNavigation = new PageNavigation();

  //Do this last!
  //
  //Add one router for the application
  app.router = new Workspace();

  //Kick off the Backbone.js router
  Backbone.history.start();

});
