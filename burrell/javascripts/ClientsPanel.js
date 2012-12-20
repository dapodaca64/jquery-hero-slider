var ClientsPanel = function(options) {
  var defaults = {
    el: false
  };
  this.options = $.extend({}, defaults, options);
  this.$el = $(this.options.el);
  this.$closeButton = this.$el.find(".close-button");
  this.$contactButton = this.$el.find(".module-contact");
  this.expanded = false;
  this.heightOrig = this.$el.height();
  this.$el.css("height", "");
  this.heightTall = this.$el.height() - 27; //TODO: Make the 25 pixels padding dynamic calc
  this.$el.css("height", this.heightOrig);
  this.aSpeed = 800;
  this.hoverSpeed = 200;

  this.init();

};

ClientsPanel.prototype.init = function(){
  //console.log("ClientsPanel.init with el %o", $(this.$el)[0]);

  this.bindEvents();

};

ClientsPanel.prototype.addCursor = function(){

  this.$el.css("cursor", "pointer");

};

ClientsPanel.prototype.removeCursor = function(){

  this.$el.css("cursor", "");

};

ClientsPanel.prototype.bindEvents = function(){

  //console.log("ClientsPanel.bindEvents...");
  this.bindContactEvents();

  this.bindPanelClick();

  this.$closeButton.on("click", this.closeButtonClickHandler.bind(this));

};

ClientsPanel.prototype.bindPanelClick = function(){

  this.addCursor();

  this.unBindContactEvents();

  this.$el.on("click", this.clientsClickHandler.bind(this));

};

ClientsPanel.prototype.unBindPanelClick = function(){

  this.removeCursor();

  this.bindContactEvents();

  this.$el.off("click");

};

ClientsPanel.prototype.bindContactHover = function(){

  this.$contactButton.on("mouseenter", this.contactButtonHoverHandler.bind(this));

  this.$contactButton.on("mouseleave", this.contactButtonHoverOutHandler.bind(this));

};

ClientsPanel.prototype.unBindContactHover = function(){

  this.$contactButton.off("mouseenter");

  this.$contactButton.off("mouseleave");

};

ClientsPanel.prototype.bindContactEvents = function(ev){

  this.bindContactHover();

  this.$contactButton.on("click", this.contactButtonClickHandler.bind(this));

};

ClientsPanel.prototype.unBindContactEvents = function(ev){

  this.unBindContactHover();

  this.$contactButton.off("click");

};

ClientsPanel.prototype.stopContactHoverAnimation = function(ev){

  this.$contactButton.find(".module-background .active").stop();

};

ClientsPanel.prototype.contactButtonHoverHandler = function(ev){

  this.stopContactHoverAnimation();

  this.$contactButton.find(".module-background .active").fadeIn(this.hoverSpeed);

};

ClientsPanel.prototype.contactButtonHoverOutHandler = function(ev){

  this.stopContactHoverAnimation();

  this.$contactButton.find(".module-background .active").fadeOut(this.hoverSpeed);

};

ClientsPanel.prototype.contactButtonClickHandler = function(ev){
  ev.preventDefault();
  ev.stopPropagation();

  this.scrollToFooter();

};

ClientsPanel.prototype.clientsClickHandler = function(ev){
  ev.preventDefault();

  //console.log("clientsClickHandler...");

  this.doExpand();

};

ClientsPanel.prototype.closeButtonClickHandler = function(ev){
  ev.preventDefault();
  ev.stopPropagation();

  this.doCollapse();

};

ClientsPanel.prototype.doCollapse = function(){

  this.$closeButton.fadeOut(this.aSpeed);

  this.$el.animate({
    height: this.heightOrig
  }, this.aSpeed, function(){
    this.$el.addClass("collapsed");
  }.bind(this));

  this.bindPanelClick();

  this.expanded = false;

};

ClientsPanel.prototype.doExpand = function(){

  this.$el.removeClass("collapsed");

  this.$el.animate({
    height: this.heightTall
  }, this.aSpeed, function(){
    this.$closeButton.fadeIn(this.aSpeed);
  }.bind(this));

  this.unBindPanelClick();

  this.expanded = true;

};

ClientsPanel.prototype.scrollToFooter = function(){
  console.log("scroll to footer!");

  var $target = $("#footer");

  $.smoothScroll({
    scrollTarget: $target
  });

};

