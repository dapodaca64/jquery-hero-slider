// Filter Navigation

var StoryModule = function(options) {
  var defaults = {
    el: false,
    animatedElementSelectors: [ ],
    animationDuration: 200
  };

  //set options
  this.options = $.extend({}, defaults, options);

  //set initial properties
  this.$el = $(this.options.el);
  this.aSpeed = this.options.animationDuration;
  this.isAnimating = false;
  this.originalRowHeight = this.$el.parents(".module-row").height();

  //DOM elements
  this.expandedState = this.$el.parents(".module-row").find(".module-expanded");
  this.collapsedBackground = this.$el.find(".module-background");
  this.fadedWhileExpanded = this.$el.parents(".module-group").find(".fade-module-expanded");
  this.closeButton = this.$el.parents(".module-row").find(".close-button");

  this.init();

};

StoryModule.prototype.init = function(){

  this.setExpandedHeight();

  if (this.$el) {
    this.bindEvents();
    this.addCursor();
  }

};

StoryModule.prototype.bindEvents = function(){

  this.bindCollapsedHovers();

  this.$el.on("click", this.moduleClickHandler.bind(this));

  this.closeButton.on("click", this.closeClickHandler.bind(this));

  this.closeButton.on("mouseenter", this.closeHoverHandler.bind(this));

  this.$videoPlaceholder = this.$el.next(".module-expanded").find(".embed-youtube-video");
  //console.log("$videoPlaceholder %o", this.$videoPlaceholder[0]);
  this.$videoPlaceholder.on("click", this.videoPlaceholderClickHandler.bind(this));

};

StoryModule.prototype.hasExpanded = function(){

  //var expanded = this.$el.next(".module-expanded");
  //console.log("hasExpanded test %o", expanded);
  return (this.$el.next(".module-expanded").length) ? true : false;

};

StoryModule.prototype.addCursor = function(){

  if (this.expandedState) {
    this.$el.css({
      cursor: "pointer"
    });
  }

};

StoryModule.prototype.removeCursor = function(){
  this.$el.css({
    cursor: ""
  });
};

StoryModule.prototype.bindCollapsedHovers = function(ev){

  this.$el.on("mouseenter", this.hoverHandler.bind(this));

  this.$el.on("mouseleave", this.hoverOutHandler.bind(this));

};

StoryModule.prototype.unBindCollapsedHovers = function(ev){

  this.$el.off("mouseenter");

  this.$el.off("mouseleave");

};

StoryModule.prototype.hoverHandler = function(ev){
  //console.log("hoverHandler");
  this.highlight();
};

StoryModule.prototype.hoverOutHandler = function(ev){
  //console.log("hover out.");

  this.unHighlight();

};

StoryModule.prototype.highlight = function(){

  for (var i=0, j=this.options.animatedElementSelectors.length; i<j; i++) {

    //console.log("animation targets %o", this.options.animatedElementSelectors[i]);

    if (this.isAnimating) {
      for (var targetType in this.options.animatedElementSelectors[i]) {
        var $target = this.$el.find(this.options.animatedElementSelectors[i][targetType]);
        $target.stop();
      }
    }

  if (!this.$el.hasClass("sticky-highlight")) {

    this.isAnimating = true;

    for (var targetType in this.options.animatedElementSelectors[i]) {

      var $target = this.$el.find(this.options.animatedElementSelectors[i][targetType]);

      //console.log("targetType %o", targetType);

      if (targetType === "fadeIn") {
        //console.log("fade in %o", $target[0]);

        $target.fadeIn(this.aSpeed, function(){
          this.isAnimating = false;
        }.bind(this));
        $target.dequeue();

      } else if (targetType === "fadeOut") {
        //console.log("fade out %o", $target[0]);

        $target.fadeOut(this.aSpeed, function(){
          this.isAnimating = false;
        }.bind(this));
        $target.dequeue();

      }

    }

  }

  }

};

StoryModule.prototype.unHighlight = function(){

  if (!this.$el.hasClass("sticky-highlight")) {

    this.isAnimating = true;

    for (var i=0, j=this.options.animatedElementSelectors.length; i<j; i++) {

      //console.log("animated selector %o", this.options.animatedElementSelectors[i] );
      for (var targetType in this.options.animatedElementSelectors[i]) {

        var $target = this.$el.find(this.options.animatedElementSelectors[i][targetType]);
        if (targetType === "fadeIn") {

          $target.fadeOut(this.aSpeed, function(){
            this.isAnimating = false;
          }.bind(this));
          $target.dequeue();

        } else if (targetType === "fadeOut") {

          $target.fadeIn(this.aSpeed, function(){
            this.isAnimating = false;
          }.bind(this));
          $target.dequeue();

        }

      }

    }

  }

};

StoryModule.prototype.moduleClickHandler = function(ev) {
  ev.preventDefault();
  //console.log("click on this %o ev %o, ev.target %o,  ev.currentTarget %o", this, ev, ev.target, ev.currentTarget);

  //only do operation if we have an expansion state to use
  if (this.hasExpanded()) {

    //console.log("Module has expanded state!");
    if (this.expanded) {

      //make a function of a close button
      //this.doCollapse();

    } else {

      this.doExpansion();

    }

  }

};

StoryModule.prototype.closeHoverHandler = function(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  //console.log("close hover.");
};

StoryModule.prototype.closeClickHandler = function(ev) {
  ev.stopPropagation();

  this.doCollapse();

};

StoryModule.prototype.videoPlaceholderClickHandler = function(ev) {
  ev.preventDefault();

  var videoID = $(ev.currentTarget).attr("rel");

  if (videoID) {

    this.doYouTubeEmbed(videoID);

  }

};

StoryModule.prototype.setExpandedHeight = function() {
  $(this.expandedState).css({
    "visibility": "hidden",
    "display": "block"
  });
  this.expandedHeight = $(this.expandedState).height();
  $(this.expandedState).css({
    "visibility": "",
    "display": "none"
  });
};

StoryModule.prototype.doExpansion = function(ev) {

  //console.log("collapsedBackground %o, expandedState %o, this.closeButton %o", this.collapsedBackground, this.expandedState, this.closeButton);

  if (this.expandedState) {

    var doFadeChanges = function(){
      this.fadedWhileExpanded.fadeOut(this.aSpeed);
      this.collapsedBackground.fadeOut(this.aSpeed);
      this.expandedState.fadeIn(this.aSpeed);
      this.closeButton.fadeIn(this.aSpeed);
    }.bind(this);

    var doHeightChanges = function(){
      this.$el.parents(".module-row").animate({
        height: this.expandedHeight+133
      }, this.aSpeed, function(){
        //console.log("expansion complete.");
      });
    }.bind(this);

    doFadeChanges();

    var wait = setTimeout(function(){

      doHeightChanges();

    }.bind(this), this.aSpeed*1.5);


  }

  this.removeCursor();
  this.unBindCollapsedHovers();
  this.expanded = true;

};

StoryModule.prototype.doCollapse = function(ev) {

  if (this.expandedState) {

    //console.log("set height of row to %o", this.originalRowHeight);

    this.removeYouTubeEmbed();

    var wait = setTimeout(function(){

      this.$el.parents(".module-row").animate({
        height: this.originalRowHeight
      }, this.aSpeed, function(){
        //console.log("collapse complete.");
      });

      //this.expandedState.find(".expanded-background").fadeOut(this.aSpeed);
      this.collapsedBackground.fadeIn(this.aSpeed/1.5);
      this.fadedWhileExpanded.fadeIn(this.aSpeed);
      this.expandedState.fadeOut(this.aSpeed);
      this.closeButton.fadeOut(this.aSpeed);

    }.bind(this), 50);

  }

  this.addCursor();
  this.bindCollapsedHovers();
  this.expanded = false;

};

StoryModule.prototype.doYouTubeEmbed = function(videoID) {

  //console.log("doYouTubeEmbed for %o...", videoID);

  this.$videoPlaceholder.hide();

  var embed = '<div class="youtube-embed"><iframe width="640" height="360" ' +
              'src="http://www.youtube-nocookie.com/embed/' +
              videoID +
              '?rel=0&autoplay=1" frameborder="0" allowfullscreen></iframe></div>';

  this.$el.parents(".module-row").find(".module-expanded .module-fixed-width").append(embed);

};

StoryModule.prototype.removeYouTubeEmbed = function() {

  this.$videoPlaceholder.show();

  this.$el.parents(".module-row").find(".module-expanded .youtube-embed").empty();

};
