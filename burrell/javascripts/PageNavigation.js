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

  this.$topLinks.click(this.topLinkClickHandler.bind(this));

  this.$backLinks.click(this.backLinkClickHandler);

  this.$heroLinks.click(this.heroLinkClickHandler.bind(this));

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
    var rowIndex = $(ev.currentTarget).parents(".page-navigation").attr("data-row-index");
    if (!rowIndex) {
      rowIndex = this.modules.get("storyIndex");
    }
    //console.log("rowIndex %o", rowIndex);
    rowIndex = +(rowIndex);
    if (direction === "down") {
      storyIndex = rowIndex;
    } else {
      storyIndex = (rowIndex) ? rowIndex - 1 : rowIndex;
    }
    //console.log("set storyIndex to %o", storyIndex);
    //window.location.hash = "#story/"+storyIndex;
    this.modules.set("storyIndex", storyIndex);
  }.bind(this), {
    offset: "50%"
  });

};

PageNavigation.prototype.topLinkClickHandler = function(ev){

  ev.preventDefault();

  var hashChoice = "#story/0";

  this.refreshHash(hashChoice);

};


PageNavigation.prototype.refreshHash = function(newHash){

  if (window.location.hash === newHash) {
    window.location.hash = newHash+"##";
  }
  var waitABit = setTimeout(function(){
    window.location.hash = newHash;
  }, 50);

};

PageNavigation.prototype.backLinkClickHandler = function(ev){

  ev.preventDefault();

  //can read from the current link's index
  var rowIndex = $(this).parents(".page-navigation").attr("data-row-index");

  //or can read from an internal model
  //var rowIndex = this.modules.get("storyIndex");
  //console.log("PageNavigation.backLinkClickHandler rowIndex %o", rowIndex);

  //only go back to the first story, no further
  var goingToIndex = (rowIndex) ? rowIndex - 1 : rowIndex;

  //delegate to application router by update hash
  window.location.hash = "#story/"+goingToIndex;

};

PageNavigation.prototype.heroLinkClickHandler = function(ev){

  ev.preventDefault();

  this.refreshHash("#hero");

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

