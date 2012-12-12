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

  console.log("PageNavigation.init..");
  this.bindEvents();

};

PageNavigation.prototype.bindEvents = function(){

  this.$topLinks.click(this.topLinkClickHandler);
  this.$backLinks.click(this.backLinkClickHandler);
  this.$heroLinks.click(this.heroLinkClickHandler);

};

PageNavigation.prototype.topLinkClickHandler = function(ev){
  ev.preventDefault();
  console.log("SCROLL TO TOP!");

};

PageNavigation.prototype.backLinkClickHandler = function(ev){
  ev.preventDefault();
  console.log("scroll to back, this clicked %o", ev.target);
  var rowIndex = $(this).parents('.module-row').attr("data-row-index");
  var goingToIndex = (rowIndex) ? rowIndex - 1 : rowIndex;
  console.log("going to row %o", goingToIndex);

};

PageNavigation.prototype.heroLinkClickHandler = function(ev){
  ev.preventDefault();
  console.log("scroll to hero, this clicked %o", ev.target);

};
