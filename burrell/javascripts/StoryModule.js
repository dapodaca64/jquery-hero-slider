// Filter Navigation

var StoryModule = function(options) {
  var defaults = {
    el: false,
    animationDuration: 800
  };

  //set options
  this.options = $.extend({}, defaults, options);

  //set initial properties
  this.$el = $(this.options.el);
  this.aSpeed = this.options.animationDuration;

  this.init();

};

StoryModule.prototype.init = function(){

  if (this.$el) {
    this.bindEvents();
  }

};

StoryModule.prototype.bindEvents = function(){

  this.$el.hover(this.hoverHandler.bind(this), this.hoverOutHandler.bind(this));

};

StoryModule.prototype.hoverHandler = function(ev){

  //console.log("hoverHandler");
  var $target = this.$el.find(".module-background .active");
  //console.log("fade in %o", target);
  $target.fadeIn(this.aSpeed);

};

StoryModule.prototype.hoverOutHandler = function(ev){

  //console.log("hover out.");
  this.$el.find(".module-background .active").fadeOut(this.aSpeed);

};

