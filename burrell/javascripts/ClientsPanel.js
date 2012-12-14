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

  this.init();

};

ClientsPanel.prototype.init = function(){
  //console.log("ClientsPanel.init with el %o", $(this.$el)[0]);

  this.bindEvents();

};

ClientsPanel.prototype.bindEvents = function(){

  //console.log("ClientsPanel.bindEvents...");

  this.$contactButton.on("click", this.contactButtonClickHandler.bind(this));

  this.$closeButton.on("click", this.closeButtonClickHandler.bind(this));

};

ClientsPanel.prototype.contactButtonClickHandler = function(ev){
  ev.preventDefault();

  if (this.expanded) {

    //this.doCollapse();
    this.scrollToFooter();

  } else {

    this.doExpand();

  }

};

ClientsPanel.prototype.closeButtonClickHandler = function(ev){
  ev.preventDefault();

  this.doCollapse();

};

ClientsPanel.prototype.doCollapse = function(){

  this.$closeButton.fadeOut(this.aSpeed);

  this.$el.animate({
    height: this.heightOrig
  }, this.aSpeed, function(){
    this.$el.addClass("collapsed");
  }.bind(this));

  this.expanded = false;

};

ClientsPanel.prototype.doExpand = function(){

  this.$el.removeClass("collapsed");

  this.$el.animate({
    height: this.heightTall
  }, this.aSpeed, function(){
    this.$closeButton.fadeIn(this.aSpeed);
  }.bind(this));

  this.expanded = true;

};

ClientsPanel.prototype.scrollToFooter = function(){

  var $target = $("#footer");

  $.smoothScroll({
    scrollTarget: $target
  });

};

