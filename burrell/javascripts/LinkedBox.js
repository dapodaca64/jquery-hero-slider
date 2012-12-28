// Linked Box

var LinkedBox = function(options) {
  var defaults = {
  };

  //set options
  this.options = $.extend({}, defaults, options);

  //set initial properties
  this.$el = $(this.options.el);
  this.init();

};

LinkedBox.prototype.init = function(){

  this.targetLocation = this.$el.attr("rel");
  this.targetWindow = this.$el.attr("data-target");

  this.bindEvents();

};

LinkedBox.prototype.bindEvents = function(){

  this.$el.click(this.linkedBoxClickHandler.bind(this));

};

LinkedBox.prototype.linkedBoxClickHandler = function(ev){

  ev.preventDefault();

  console.log("LinkedBox.linkedBoxClickHandler ev %o", ev);
  console.log("target %o", this.targetLocation);

  this.goTo(this.targetLocation, this.targetWindow);

};

LinkedBox.prototype.goTo = function(url, viewport){
  var target = "_self";

  if (viewport) {
    target = viewport;
  }

  window.open(url, target);

};
