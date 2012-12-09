var StickyElement = function(options) {
  var defaults = {
    el: false,
    stickyOnScrollY: false,
    stickyScrollWidthLimit: 100,
    stickyOnWidth: false,
    stickyStyle: { position: "fixed", borderBottom: "solid 1px green"  },
    unStickyStyle: { position: "static", borderBottom: "solid 1px red" },
    stickyWidthScrollLimit: function(){ },
    stickyScrollWidthLimit: function(){ }
  };
  this.options = $.extend({}, defaults, options);
  this.$el = this.options.el;

  this.init();

};

StickyElement.prototype.init = function(){
  console.log("StickyElement.init with el %o", $(this.$el)[0]);

  this.setupViewportModel();

  this.bindViewportEvents();

};

StickyElement.prototype.setupViewportModel = function(){

  this.viewport = new BasicModel({
    width: $(".everything"),
    scrollPosY: 0
  });

  //console.log("setup based on this.stickyOnWidth %o, this.stickyOnScrollY %o", this.options.stickyOnWidth, this.options.stickyOnScrollY);

  this.viewport.on("change:width", this.windowResizeChangeHandler.bind(this));

  this.viewport.on("change:scrollPosY", this.windowScrollChangeHandler.bind(this));

};

StickyElement.prototype.bindViewportEvents = function(){

  $(window).resize(function(){
    this.viewport.set("width", $(".everything").width());
  }.bind(this));

  $(window).scroll(function(){
    this.viewport.set("scrollPosY", window.scrollY);
  }.bind(this));
};

StickyElement.prototype.windowResizeChangeHandler = function(){
  //console.log("StickyElement.windowResizeChangeHandler..");
  var width = $(".everything").width();
  var scrollY = window.scrollY;
  //console.log("width, this.options.stickyOnWidth %o, %o", width, this.options.stickyOnWidth);

  if (width <= this.options.stickyOnWidth) {
    this.makeNotSticky();
  } else {
    //console.log("scrollY, this.options.stickyWidthScrollLimit %o, %o", width, this.options.stickyWidthScrollLimit());
    if (scrollY > this.options.stickyWidthScrollLimit()) {
      this.makeSticky();
    }
  }
};

StickyElement.prototype.windowScrollChangeHandler = function(){
  //console.log("StickyElement.windowScrollChangeHandler..");
  var width = $(".everything").width();
  var scrollY = window.scrollY;
  //console.log("scrollY, this.options.stickyOnScrollY %o, %o", scrollY, this.options.stickyOnScrollY() );
  if (scrollY >= this.options.stickyOnScrollY()) {
      //window scroll does not override width sticky
      //console.log("width, stickyScrollWidthLimit %o, %o", width, this.options.stickyScrollWidthLimit);
      if (width > this.options.stickyScrollWidthLimit) {
        //console.log("scrollY make sticky");
        this.makeSticky();
      } else {
        this.makeNotSticky();
      }
  } else {
    //console.log("scrollY make NOT sticky");
    this.makeNotSticky();
  }
};

StickyElement.prototype.makeSticky = function(){
  this.$el.css(this.options.stickyStyle);
};

StickyElement.prototype.makeNotSticky = function(){
  this.$el.css(this.options.unStickyStyle);
};
