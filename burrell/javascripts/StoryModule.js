// Filter Navigation

var StoryModule = function(options) {
  var defaults = {
    el: false,
    animatedElementSelectors: [ ],
    animationDuration: 400
  };

  //set options
  this.options = $.extend({}, defaults, options);

  //set initial properties
  this.$el = $(this.options.el);
  this.aSpeed = this.options.animationDuration;
  this.isAnimating = false;

  this.init();

};

StoryModule.prototype.init = function(){

  if (this.$el) {
    this.bindEvents();
  }

};

StoryModule.prototype.bindEvents = function(){

  this.$el.hover(this.hoverHandler.bind(this), this.hoverOutHandler.bind(this));

  this.$el.click(this.clickHandler.bind(this));

};

StoryModule.prototype.hoverHandler = function(ev){
  //console.log("hoverHandler");
  //
  for (var i=0, j=this.options.animatedElementSelectors.length; i<j; i++) {

    //console.log("animation targets %o", this.options.animatedElementSelectors[i]);

    if (this.isAnimating) {
      for (var targetType in this.options.animatedElementSelectors[i]) {
        var $target = this.$el.find(this.options.animatedElementSelectors[i][targetType]);
        $target.stop();
      }
    }

    this.isAnimating = true;

    for (var targetType in this.options.animatedElementSelectors[i]) {

      var $target = this.$el.find(this.options.animatedElementSelectors[i][targetType]);

      if (targetType === "fadeIn") {
        //console.log("fade in %o", $target[0]);

        $target.fadeIn(this.aSpeed, function(){
          this.isAnimating = false;
        }.bind(this));

      } else if (targetType === "fadeOut") {
        //console.log("fade out %o", $target[0]);

        $target.fadeOut(this.aSpeed, function(){
          this.isAnimating = false;
        }.bind(this));

      }

    }

  }

};

StoryModule.prototype.hoverOutHandler = function(ev){
  //console.log("hover out.");

  this.isAnimating = true;

  for (var i=0, j=this.options.animatedElementSelectors.length; i<j; i++) {

    //console.log("animated selector %o", this.options.animatedElementSelectors[i] );
    for (var targetType in this.options.animatedElementSelectors[i]) {

      var $target = this.$el.find(this.options.animatedElementSelectors[i][targetType]);
      if (targetType === "fadeIn") {

        $target.fadeOut(this.aSpeed);

      } else if (targetType === "fadeOut") {

        $target.fadeIn(this.aSpeed, function(){
          this.isAnimating = true;
        }.bind(this));

      }


    }
  }

};

StoryModule.prototype.clickHandler = function(ev) {
  ev.preventDefault();

  //console.log("click on this %o", this);

  var expandedState = this.$el.parents(".module-row").find(".module-expanded");

  console.log("have expandedState %o", expandedState);
  if (expandedState) {


  }

};

