// Filter Navigation

var PageNavigation = function(options) {
  var defaults = {
  };

  //set options
  this.options = $.extend({}, defaults, options);

  //set initial properties
  this.init();

};

PageNavigation.prototype.init = function(){

  this.$topLinks = $(".go-top");

  this.$backLinks = $(".go-back");

  this.$heroLinks = $(".go-hero");

  this.modules = new BasicModel({
    storyIndex: 0
  });
  this.modules.on("change", function(module){
    //console.log("change story to storyIndex %o", module);
    var storyIndex = module.get("storyIndex");
    //window.location.hash = "#story/"+storyIndex;
  }.bind(this));

  this.bindEvents();

};

PageNavigation.prototype.bindEvents = function(){

  this.$topLinks.click(this.topLinkClickHandler);

  this.$backLinks.click(this.backLinkClickHandler.bind(this));

  this.$heroLinks.click(this.heroLinkClickHandler);

  $.waypoints.settings.scrollThrottle = 30;
  /*
  $(".everything").waypoint(function(ev, direction){
    //console.log("everything waypoint ev %o, direction %o", ev, direction);
  }, {
    offset: "-100%"
  });
  */
  $(".module-row, .footer-modules").waypoint(function(ev, direction){
    ev.stopPropagation();
    //console.log("module row waypoint on ev %o, direction %o", ev, direction);
    var storyIndex;
    var rowIndex = $(ev.currentTarget).attr("data-row-index");
    //var rowIndex = this.modules.get("storyIndex");
    rowIndex = +(rowIndex);
    if (direction === "down") {
      storyIndex = rowIndex;
    } else {
      storyIndex = (rowIndex) ? rowIndex - 1 : rowIndex;
    }
    //window.location.hash = "#story/"+storyIndex;
    this.modules.set("storyIndex", storyIndex);
  }.bind(this), {
    offset: "50%"
  });

};

PageNavigation.prototype.topLinkClickHandler = function(ev){

  ev.preventDefault();

  window.location.hash = "#story/0";

};

PageNavigation.prototype.backLinkClickHandler = function(ev){

  ev.preventDefault();

  //can read from the current link's index
  //var rowIndex = $(this).parents('.module-row').attr("data-row-index");

  //or can read from an internal model
  var rowIndex = this.modules.get("storyIndex");
  //console.log("PageNavigation.backLinkClickHandler rowIndex %o", rowIndex);

  //only go back to the first story, no further
  var goingToIndex = (rowIndex) ? rowIndex - 1 : rowIndex;

  //delegate to application router by update hash
  window.location.hash = "#story/"+goingToIndex;

};

PageNavigation.prototype.heroLinkClickHandler = function(ev){

  ev.preventDefault();

  if (window.location.hash === "#hero") {
    window.location.hash = "#hero1";
  }
  var waitABit = setTimeout(function(){
    window.location.hash = "#hero";
  }, 50);

};

PageNavigation.prototype.goToStory = function(storyIndex) {

  //nconsole.log("PageNavigation.goToStory %o", storyIndex);

  //update the model
  this.modules.set("storyIndex", +(storyIndex));

  //update the view
  var $target = $("[data-row-index='"+storyIndex+"']");

  //console.log("scroll to %o", $target[0]);

  $.smoothScroll({
    scrollTarget: $target,
    offset: -250
  });

};

PageNavigation.prototype.goToHero = function(slideIndex) {

  //console.log("PageNavigation.goToHero %o", slideIndex);

  var $target = $(".hero-slider");
  $.smoothScroll({
    scrollTarget: $target
  });

};

