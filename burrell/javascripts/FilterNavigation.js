// Filter Navigation

var FilterNavigation = function(options) {
  var defaults = {
    el: false
  };

  //set options
  this.options = $.extend({}, defaults, options);

  //set initial properties
  this.$el = this.options.el;
  this.init();

};

FilterNavigation.prototype.init = function(){
  //console.log("FilterNavigation.init..");

  this.viewport = new BasicModel({
    width: $(".everything").width(),
    scrollY: 0
  });

  this.$filterGroups = this.$el.find(".filter-nav-group");
  this.fixedGap = 154;

  this.viewport.on("change:width", this.viewportWidthChangeHandler.bind(this));

  this.setupResizing();

};

FilterNavigation.prototype.setupResizing = function(){

  $(window).resize(function(){

    this.viewport.set("width", $(".everything").width() );

  }.bind(this));

  this.viewport.trigger("change:width");

};

FilterNavigation.prototype.viewportWidthChangeHandler = function(viewport){

  this.resizeFilterButtons(viewport);

};

FilterNavigation.prototype.resizeFilterButtons = function(viewport){

  //console.log("resizeFilterGroups %o", this.$filterGroups);
  var groupCount = this.$filterGroups.length;

  var groupTotalWidth = (viewport.width - this.fixedGap);
  var remainder = groupTotalWidth % groupCount;
  var groupWidth = Math.floor(groupTotalWidth/2);
  //console.log("groupTotalWidth %o", groupTotalWidth);
  //console.log("remainder %o", remainder);
  //console.log("groupWidth %o", groupWidth);

  this.$filterGroups.eq(0).css("width", groupWidth+"px");
  this.$filterGroups.eq(1).css("width", groupWidth+remainder+"px");

};
