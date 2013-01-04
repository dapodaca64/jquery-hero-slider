$ = jQuery;

// Example Usage: HeroSlider Controller
//
// Example B: One Controller manages a two sets of slides.
//
// The Controller sets up the Presenters
// Two Presenters are created to associate each set of slides to the View
//   The Presenters contain presentational and animation logic
//
// One set of slides is used as a landing/default slide show
//
// Another set of slides is used as a detail slide show,
//   having additional slides.

// The Controller sets up two Models, one for each set of slides.
//
// The Controller allows the Presenter to Access the Model
//
// The Model contains basic data attributes and event binding
//   the slideIndex, and the layoutMode
//   of "default" and "detail" (coupled) states
//   of each slide/story

var HeroSliderBurrell = function(options){
  HeroSlider.call(this, options); //call super constructor
};

HeroSliderBurrell.prototype = Object.create(HeroSlider.prototype);

HeroSliderBurrell.prototype.init = function(){
  // Model for the landing state slides
  this.storySummary = new BasicModel({
    storyIndex: 0,
    storyCount: 0
  });

  // Model for the detail state slides
  this.storyDetail = new BasicModel({
    storyIndex: 0,
    storyCount: 0
  });

  //Model for Story slide width
  this.storySlide = new BasicModel({
    width: 1000
  });

  // Assure we have DOM before creating Presenters
  if (this.$el.length) {


    this.summaryPresenter = new SlidePresenterBurrellSummary({

      // Reference the controller/creator
      controller: this,

      // Specific DOM Scope
      el: this.$el.find(".slider-summary"),

      //pass on the presentational behavior configurations
      autoRotate: this.options.autoRotate,
      circular: this.options.circular

    });

    this.detailPresenter = new SlidePresenterBurrellDetail({

      // Reference the controller/creator
      controller: this,

      // Specific DOM Scope
      el: this.$el.find(".slider-detail"),

      //pass on the presentational behavior configurations
      autoRotate: this.options.autoRotate,
      circular: this.options.circular

    });

    this.setupViewport();

    if (this.autoRotate) {
      //console.log("HeroSliderBurrell going to auto-rotate!");
      this.startAutoRotation();
    }

  }

};

HeroSliderBurrell.prototype.setupViewport = function(){

  // Model for the viewport size
  var viewportDims = this.getViewportDims();
  //console.log("viewportDims %o", viewportDims);
  this.viewport = new BasicModel(viewportDims);

  // Resize the hero based on the viewport
  //this.resizeHero(viewportDims);

  //Subscribe to the change event on the model via the controller
  this.viewport.on("change", this.viewportChangeHandler.bind(this));

  //Bind the DOM event that updates the model
  $(window).resize(function(ev){
  //console.log("HeroSliderBurrell window resize this %o..", this);
    var viewportDims = this.getViewportDims();
    //console.log("HeroSliderBurrell window resize to, h %o, %o", viewportDims.width, viewportDims.height);

    this.viewport.set(viewportDims);

    var heroHeight = this.$el.height();

    this.summaryPresenter.resizeBackgrounds({
      width: viewportDims.width,
      height: heroHeight
    });

  }.bind(this));
  //$(window).trigger("resize");
  this.viewport.trigger("change");

  this.storySlide.on("change", this.summaryPresenter.storySlideChangeHandler.bind(this.summaryPresenter));
  this.storySlide.on("change", this.detailPresenter.storySlideChangeHandler.bind(this.detailPresenter));
  this.storySlide.set("width", $(".everything").width());
  this.storySlide.trigger("change");


};

HeroSliderBurrell.prototype.getViewportDims = function(){
  var frameDims = Animator.getBoxDimensions(".everything");
  var windowDims = Animator.getBoxDimensions(window);
  return {
    width: frameDims.width,
    height: windowDims.height
  };
};

HeroSliderBurrell.prototype.getSlideOffsetFromZero = function(slideIndex, el){
  var slideOffsetFromZero = 0;
  $(el).find(".story").each(function(idx) {
    //console.log("slideIndex %o, idx %o", slideIndex, idx);
    if (idx+1 <= slideIndex) {
      slideOffsetFromZero += $(this).width();
    };
  });
  return slideOffsetFromZero;
};

HeroSliderBurrell.prototype.getSliderOffset = function($el){
  var sliderCSSLeft = $el.css("left");
  var offset = (sliderCSSLeft) ? -( sliderCSSLeft.substring(0, sliderCSSLeft.length-2) ) : 0;
  return offset;
};

HeroSliderBurrell.prototype.getSlideMoveOffset = function(slideIndex, $el){
  var sliderOffset = this.getSliderOffset($el);
  var slideOffsetFromZero = this.getSlideOffsetFromZero(slideIndex, $el);
  var totalSlide = slideOffsetFromZero - sliderOffset;
  return totalSlide;
};

HeroSliderBurrell.prototype.adjustForSlideWidthChange = function(model, slideIndex, slideAnimation, slideContentAnimation, $el) {

  //this.controller.adjustForSlideWidthChange(storySlide, slideIndex,
    //this.controller.getAnimatedElement("storySlide"), this.controller.getAnimatedElement("storySummary"));

  //Update slide widths
  Animator.resizeBox(slideAnimation.$el, {
    width: model.get("width")
  }, 0);

  //Move the slider position
  var newLeft = this.getSlideOffsetFromZero(slideIndex, $el);
  slideContentAnimation.$el.css("left", -newLeft+"px");

};

HeroSliderBurrell.prototype.startAutoRotation = function(){
  this.setRotateTimeout();
};

HeroSliderBurrell.prototype.stopAutoRotation = function(){
  this.stopRotateTimeout();
};

HeroSliderBurrell.prototype.setRotateTimeout = function(){
  this.rotateTimeout = setTimeout(function(){
    this.nextStory(this.storySummary);
    this.setRotateTimeout();
  }.bind(this), this.options.autoRotateWait);
};

HeroSliderBurrell.prototype.stopRotateTimeout = function(){
  if (this.rotateTimeout) {
    clearTimeout(this.rotateTimeout);
  }
};

HeroSliderBurrell.prototype.viewportChangeHandler = function(viewport){
  //console.log("HeroSliderBurrell.viewportChangeHandler(%o) this %o", viewport, this);
  this.resizeHero(viewport);
};

HeroSliderBurrell.prototype.resizeHero = function(vp){
  //console.log("resizeHero with this %o, this.$el %o", this, this.$el[0]);
  //console.log("detail el %o", this.detailPresenter.$el[0]);
  //console.log("summary el %o", this.summaryPresenter.$el[0]);
  //console.log("HeroSliderBurrell resize hero based on %o", vp);
  Animator.resizeBox(this.$el, {
    width: vp.width
    //DISABLED: Dynamic height to fill the viewport
    //NOW: static px height via CSS
    //leave room for some content to 'peek' above the fold
    //include a proportional reduction of 20%
    //height: (vp.height-100)*0.84
  }, 0);
};


/* Presenter: Summary Slides */

var SlidePresenterBurrellSummary = function(options){
  SlidePresenter.call(this, options); //call super constructor
  //this.$el = this.controller.$el;
  this.$el = $(options.el);
  this.init();
};
SlidePresenterBurrellSummary.prototype = Object.create(SlidePresenter.prototype);
SlidePresenterBurrellSummary.prototype.parent = SlidePresenter.prototype;
SlidePresenterBurrellSummary.prototype.init = function() {
  // Call the parent init function
  this.parent.init.call(this);

  var storyCount;
  if (this.$el) {
    storyCount = this.$el.find(".story").length;
    if (storyCount) {
      //update story count on the Model
      this.controller.storySummary.set("storyCount", storyCount);

      //register animated elements
      this.setupAnimatedElements();

      this.showSummarySlides();
      this.showSummaryNav();
    }
  }
};
SlidePresenterBurrellSummary.prototype.events = {
  "click .summary-navigation-left-right a.go-next": "nextStoryClickHandler",
  "click .summary-navigation-left-right a.go-previous": "previousStoryClickHandler",
  "click .slider-summary .go-detail": "detailClickHandler",
  "mouseenter .teaser": "teaserMouseEnterHandler",
  "mouseleave .teaser": "teaserMouseLeaveHandler"
};

// DOM event handlers
SlidePresenterBurrellSummary.prototype.nextStoryClickHandler = function(ev){
  ev.preventDefault();
  //console.log("SlidePresenterBurrellSummary.nextStoryClickHandler: this %o", this);
  //console.log("SlidePresenterBurrellSummary.nextStoryClickHandler: this.controller %o", this.controller);
  this.controller.stopAutoRotation();
  this.controller.nextStory(this.controller.storySummary);
};

SlidePresenterBurrellSummary.prototype.previousStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.stopAutoRotation();
  this.controller.previousStory(this.controller.storySummary);
};

SlidePresenterBurrellSummary.prototype.detailClickHandler = function(ev){
  //console.log("detailClickHandler %o", ev);
  ev.preventDefault();
  var detailLink = $(ev.target).parents(".story").find(".go-detail");
  var detailIndex = parseInt($(detailLink).attr("data-storyindex"));
  //console.log("detailClickHandler with index %o", detailIndex);
  this.goToDetail(detailIndex)
};

SlidePresenterBurrellSummary.prototype.teaserMouseEnterHandler = function(ev){
  this.showTeaserBackgroundActive();
};

SlidePresenterBurrellSummary.prototype.teaserMouseLeaveHandler = function(ev){
  this.hideTeaserBackgroundActive();
};

// Data event handlers
SlidePresenterBurrellSummary.prototype.storyIndexChangeHandler = function(story) {
  //console.log("SlidePresenterBurrellSummary.storyIndexChangeHandler for model %o", story);
  this.goToSlide(story.get("storyIndex"));
};

 SlidePresenterBurrellSummary.prototype.bindDataEvents = function(){
    //Subscribe to the change event on the model via the controller
  this.controller.storySummary.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
};

SlidePresenterBurrellSummary.prototype.goToSlide = function(slideIndex){
  //console.log("SlidePresenterBurrellSummary.goToSlide slideIndex %o", slideIndex);
  var slideOffsetFromZero = 0;
  var sliderOffset = this.$el.css("left");
  sliderOffset = -(sliderOffset.substring(0, sliderOffset.length-2));
  this.$el.find(".story").each(function(idx) {
    if (idx+1 <= slideIndex) {
      slideOffsetFromZero += $(this).width();
    }
  });
  //console.log("SlidePresenterBurrellSummary.goToSlide sliderOffset %o, total slideOffsetFromZero %o", sliderOffset, slideOffsetFromZero);
  var totalSlide = slideOffsetFromZero - sliderOffset;
  //console.log("SlidePresenterBurrellSummary.goToSlide total slide: %o", totalSlide);

  var navAnimation = this.controller.getAnimatedElement("summaryNav");
  navAnimation.options.animateProperties = { opacity: 0 };
  navAnimation.startAnimation();

  var storyAnimation = this.controller.getAnimatedElement("storySummary");
  storyAnimation.options.animateProperties.left = "-="+totalSlide;
  storyAnimation.options.animateCallback = function(){
    navAnimation.options.animateProperties = { opacity: 1 };
    navAnimation.startAnimation();
  };
  //console.log("working with storyAnimation %o for element %o, totalSlide %o left", storyAnimation, storyAnimation.options.el[0], totalSlide);
  storyAnimation.startAnimation();

};

SlidePresenterBurrellSummary.prototype.goToDetail = function(slideIndex){
  this.controller.stopAutoRotation();
  //console.log("SlidePresenterBurrellSummary.goToDetail %o", slideIndex);
  //set the detail story state
  if (typeof slideIndex === "number") {
    //via the Controller, The Detail Presenter sets this
    this.controller.detailPresenter.snapToStory(slideIndex);
  }

  this.showDetailSlides();

  this.hideSummarySlides();

  this.hideSummaryNav();

  this.showDetailNav();

  this.showItemNav();
};

SlidePresenterBurrellSummary.prototype.showSummarySlides = function(){
  var summaryAnimation = this.controller.getAnimatedElement("storySummary");
  Animator.fadeIn(summaryAnimation.options.el, summaryAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.hideSummarySlides = function(){
  var summaryAnimation = this.controller.getAnimatedElement("storySummary");
  Animator.fadeOut(summaryAnimation.options.el, summaryAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.showDetailSlides = function(){
  var detailAnimation = this.controller.getAnimatedElement("storyDetail");
  Animator.fadeIn(detailAnimation.options.el, detailAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.hideDetailSlides = function(){
  var detailAnimation = this.controller.getAnimatedElement("storyDetail");
  Animator.fadeOut(detailAnimation.options.el, detailAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.showDetailNav = function(){
  var detailNavAnimation = this.controller.getAnimatedElement("detailNav");
  Animator.fadeIn(detailNavAnimation.options.el, detailNavAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.hideDetailNav = function(){
  var detailNavAnimation = this.controller.getAnimatedElement("detailNav");
  Animator.fadeOut(detailNavAnimation.options.el, detailNavAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.showItemNav = function(){
  var itemNavAnimation = this.controller.getAnimatedElement("itemNav");
  Animator.fadeIn(itemNavAnimation.options.el, itemNavAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.hideItemNav = function(){
  var itemNavAnimation = this.controller.getAnimatedElement("itemNav");
  Animator.fadeOut(itemNavAnimation.options.el, itemNavAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.showSummaryNav = function(){
  var summaryNavAnimation = this.controller.getAnimatedElement("summaryNav");
  Animator.fadeIn(summaryNavAnimation.options.el, summaryNavAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.hideSummaryNav = function(){
  var summaryNavAnimation = this.controller.getAnimatedElement("summaryNav");
  Animator.fadeOut(summaryNavAnimation.options.el, summaryNavAnimation.options.duration);
};

SlidePresenterBurrellSummary.prototype.showTeaserBackgroundActive = function(){
  var teaserBackActive = this.controller.getAnimatedElement("teaserBackgroundActive");
  Animator.fadeIn(teaserBackActive.options.el, teaserBackActive.options.duration);
};

SlidePresenterBurrellSummary.prototype.hideTeaserBackgroundActive = function(){
  var teaserBackActive = this.controller.getAnimatedElement("teaserBackgroundActive");
  Animator.fadeOut(teaserBackActive.options.el, teaserBackActive.options.duration);
};

SlidePresenterBurrellSummary.prototype.setupAnimatedElements = function(){

  this.controller.newAnimatedElement("summaryBackground", {
    el: this.controller.$el.find(".slider-fullsize.slider-summary .background.summary"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("detailBackground", {
    el: this.controller.$el.find(".slider-fullsize.slider-detail .background.background-detail"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("teaser", {
    el: this.controller.$el.find(".slider-fullsize.slider-summary .teaser"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("teaserBackground", {
    el: this.controller.$el.find(".slider-fullsize.slider-summary .background.teaser-background.default"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("teaserBackgroundActive", {
    el: this.controller.$el.find(".slider-fullsize.slider-summary .background.teaser-background.active"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("storySummary", {
    el: this.controller.$el.find(".slider-fullsize.slider-summary"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("storyDetail", {
    el: this.controller.$el.find(".slider-fullsize.slider-detail"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("storySlide", {
    el: this.controller.$el.find(".slider-fullsize.slider-summary .story"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("detailSlide", {
    el: this.controller.$el.find(".slider-fullsize.slider-detail .story"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("summaryNav", {
    el: this.controller.$el.find(".summary-navigation-left-right"),
    animateDuration: 400
  });

  //Setup resizables

  //Story background
  var width = $(this.controller.getAnimatedElement("summaryBackground").$el).width();
  var height = $(this.controller.getAnimatedElement("summaryBackground").$el).height();
  //console.log("summary background original width, height %o, %o", width, height);
  this.summaryBackground = new BasicModel({
    widthOrig: width,
    heightOrig: height,
    width: width,
    height: height
  });
  this.summaryBackground.on("change", this.summaryBackgroundChangeHandler.bind(this));
  this.summaryBackground.on("change", this.detailBackgroundChangeHandler.bind(this));

  //Teaser background
  var teaserWidth = $(this.controller.getAnimatedElement("teaserBackground").$el).width();
  var teaserHeight = $(this.controller.getAnimatedElement("teaserBackground").$el).height();
  //console.log("teaser background original width, height %o, %o", teaserWidth, teaserHeight);
  this.teaser = new BasicModel({
    widthOrig: teaserWidth,
    heightOrig: teaserHeight,
    width: teaserWidth,
    height: teaserHeight
  });
  this.teaser.on("change", this.teaserSizeChangeHandler.bind(this));

  var viewportDims = Animator.getBoxDimensions(".everything");
  var windowDims = Animator.getBoxDimensions(window);
  //console.log("++ SET viewport to dims %o, %o", viewportDims.width, viewportDims.height);
  this.resizeBackgrounds({
    width: viewportDims.width,
    height: windowDims.height
  });

};

SlidePresenterBurrellSummary.prototype.storySlideChangeHandler = function(storySlide){
  //console.log("SlidePresenterBurrellSummary.storySlideChangeHandler with %o", storySlide);
  //HeroSliderBurrell.prototype.adjustForSlideWidthChange = function(model, slideIndex, slideAnimation, slideContentAnimation) {
  //console.log(this.controller.storySummary);
  //console.log(this.controller);
  var slideIndex = this.controller.storySummary.get("storyIndex");
  this.controller.adjustForSlideWidthChange(storySlide, slideIndex,
    this.controller.getAnimatedElement("storySlide"), this.controller.getAnimatedElement("storySummary"), this.$el);

/*
  var slideTypes = [
    this.controller.getAnimatedElement("storySlide"),
    this.controller.getAnimatedElement("detailSlide")
  ];

  for (var i=0, j=slideTypes.length; i<j; i++) {

    //Update slide widths
    Animator.resizeBox(slideTypes[i].$el, {
      width: storySlide.get("width")
    }, 0);

  }

  //Move the slider position
  var slideIndex = this.controller.storySummary.get("storyIndex");
  var storyAnimation = this.controller.getAnimatedElement("storySummary");
  var newLeft = this.controller.getSlideOffsetFromZero(slideIndex, this.$el);
  storyAnimation.$el.css("left", -newLeft+"px");

  //Move the slider position
  var slideIndex = this.controller.storyDetail.get("storyIndex");
  var storyAnimation = this.controller.getAnimatedElement("storyDetail");
  console.log("this.controller.detailPresenter %o", this.controller.detailPresenter);
  //var newLeft = this.controller.getSlideOffsetFromZero(slideIndex, this.controller.detailPresenter.$el);
  //storyAnimation.$el.css("left", -newLeft+"px");
  */

};

SlidePresenterBurrellSummary.prototype.centerHorizontally = function(background, model){
  var viewportDims = Animator.getBoxDimensions(".everything");
  var widthDiff = model.get("width") - viewportDims.width;
  var marginToCenterIt = - (widthDiff / 2) + "px";
  //console.log("viewportDims %o, model %o, widthDiff %o", viewportDims, model, widthDiff);

  background.$el.css("margin-left", marginToCenterIt);

};

SlidePresenterBurrellSummary.prototype.summaryBackgroundChangeHandler = function(summaryBackground){
  var background = this.controller.getAnimatedElement("summaryBackground");

  this.centerHorizontally(background, summaryBackground);

  Animator.resizeBox(background.$el, {
    width: summaryBackground.get("width"),
    height: summaryBackground.get("height")
  }, 0);

};

SlidePresenterBurrellSummary.prototype.detailBackgroundChangeHandler = function(summaryBackground){
  var background = this.controller.getAnimatedElement("detailBackground");
  var newHeight = this.controller.$el.height() - 162; //162 offset for the detail trim top+bottom

  this.centerHorizontally(background, summaryBackground);

  Animator.resizeBox(background.$el, {
    width: summaryBackground.get("width"),
    height: newHeight
  }, 0);

};

SlidePresenterBurrellSummary.prototype.teaserSizeChangeHandler = function(teaserBackground){
  //console.log("SlidePresenterBurrellSummary.teaserBackgroundChangeHandler with %o", teaserBackground);
  //Teaser background image - default state
  var teaser = this.controller.getAnimatedElement("teaserBackground");
  //Teaser background image - active state
  var teaserActive = this.controller.getAnimatedElement("teaserBackgroundActive");
  //Teaser box
  var teaserBox = this.controller.getAnimatedElement("teaser");

  Animator.resizeBox(teaser.$el, {
    width: teaserBackground.get("width"),
    height: teaserBackground.get("height")
  }, 0);

  Animator.resizeBox(teaserActive.$el, {
    width: teaserBackground.get("width"),
    height: teaserBackground.get("height")
  }, 0);

  Animator.resizeBox(teaserBox.$el, {
    width: teaserBackground.get("width"),
    height: teaserBackground.get("height")
  }, 0);

};

SlidePresenterBurrellSummary.prototype.getProportionalFit = function(b, a, prop1, prop2){
  //TODO: Use it or lose it
  // b is projected proportionally on a,
  // where b[prop1] / b[prop2] ratio is maintained

};

SlidePresenterBurrellSummary.prototype.resizeBackgrounds = function(vp){
  //console.log("SlidePresenterBurrellSummary.resizeBackgrounds: set to width, height: %o, %o", vp.width, vp.height);
  //get proportional fit to new width
  //background image
  var fitByWidth = { width: vp.width, height: vp.width/this.summaryBackground.get("widthOrig")*this.summaryBackground.get("heightOrig") };
  //console.log("FIT BY WIDTH width: %o, height %o", fitByWidth.width, fitByWidth.height);
  var fitByHeight = { width: vp.height/this.summaryBackground.get("heightOrig")*this.summaryBackground.get("widthOrig"), height: vp.height };
  //console.log("FIT BY HEIGHT width: %o, height %o", fitByHeight.width, fitByHeight.height);

  var fitChoice;
  // is fit by width not wide enough?
  if (vp.width/vp.height > 1) {
    //console.log("wide viewport.");
    if (vp.height > fitByWidth.height) {
      fitChoice = fitByHeight;
    } else {
      fitChoice = fitByWidth;
    }
  // is fit by height not tall enough?
  } else if (vp.width/vp.height < 1) {
    //console.log("tall viewport.");
    if (vp.width > fitByHeight.width) {
      fitChoice = fitByWidth;
    } else {
      fitChoice = fitByHeight;
    }
  //square viewport: either fit types will fill it
  } else {
    //console.log("square viewport.");
    fitChoice = fitByWidth;
  }


  //set model width using actual viewport width
  this.controller.storySlide.set({ width: vp.width });

  //set proportional fit
  this.summaryBackground.set(fitChoice);

  //teaser ribbon size
  var teaserFit = { width: vp.width, height: vp.width/this.teaser.get("widthOrig")*this.teaser.get("heightOrig") };
  this.teaser.set(teaserFit);
};

/* Presenter: Detail Slides */
var SlidePresenterBurrellDetail = function(options){
  SlidePresenter.call(this, options); //call super constructor
  //this.$el = this.controller.$el;
  this.$el = $(options.el);
  this.init();
};
SlidePresenterBurrellDetail.prototype = Object.create(SlidePresenter.prototype);
SlidePresenterBurrellDetail.prototype.parent = SlidePresenter.prototype;
SlidePresenterBurrellDetail.prototype.init = function() {
  // Call the parent init function
  this.parent.init.call(this);

  var storyCount;

  if (this.$el) {
    storyCount = this.$el.find(".story").length;
    if (storyCount) {
      //update story count on the Model
      this.controller.storyDetail.set("storyCount", storyCount);

      //register animated elements
      this.controller.newAnimatedElement("storyDetail", {
        el: this.$el,
        animateDuration: 1000
      });

      this.controller.newAnimatedElement("detailNav", {
        el: this.$el.find(".detail-navigation"),
        animateDuration: 200
      });

      this.controller.newAnimatedElement("detailNavLinks", {
        el: this.$el.find(".detail-navigation .go-previous, .detail-navigation .go-next"),
        animateDuration: 200
      });

      this.controller.newAnimatedElement("detailMain", {
        el: this.$el.find(".main-text"),
        animateDuration: 500
      });

      this.controller.newAnimatedElement("itemNav", {
        el: this.controller.$el.find(".item-navigation"),
        animateDuration: 500
      });

      this.controller.newAnimatedElement("detailQuote", {
        el: this.$el.find(".quote-left, .quote-right"),
        animateDuration: 500
      });

      this.bindItemNavClick();

    }
  }
};
SlidePresenterBurrellDetail.prototype.events = {
  "click .detail-navigation .go-next": "nextStoryClickHandler",
  "click .detail-navigation .go-previous": "previousStoryClickHandler"
  //"click .item-navigation .go-to-story": "goToClickHandler"
};

SlidePresenterBurrellDetail.prototype.bindItemNavClick = function(){
  this.controller.$el.find(".item-navigation .go-to-story").on("click", this.goToClickHandler.bind(this));
};

// DOM event handlers
SlidePresenterBurrellDetail.prototype.goToClickHandler = function(ev){
  ev.preventDefault();
  //console.log("inspecting %o", $(ev.target).parent() );
  var storyIndex = $(ev.target).parent().attr("data-storyindex");
  //console.log("Let's go storyIndex %o", storyIndex);
  this.controller.goToStory(this.controller.storyDetail, storyIndex);
};

SlidePresenterBurrellDetail.prototype.nextStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.nextStory(this.controller.storyDetail);
};

SlidePresenterBurrellDetail.prototype.previousStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.previousStory(this.controller.storyDetail);
};

// Data event handlers
SlidePresenterBurrellDetail.prototype.storyIndexChangeHandler = function(story) {
  //console.log("SlidePresenterBurrellDetail.storyIndexChangeHandler for model %o", story);
  //TODO: Find a way to stop animation only on the Summary components
  //console.log("Calling stopAnimations %o", this.controller);
  //this.controller.stopAnimations();
  this.goToSlide(story.get("storyIndex"));
  this.updateActiveStateItemNav(story.get("storyIndex"));
};

SlidePresenterBurrellDetail.prototype.bindDataEvents = function(){
  //Subscribe to the change event on the model via the controller
  this.controller.storyDetail.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
};

SlidePresenterBurrellDetail.prototype.storySlideChangeHandler = function(storySlide){
  var slideIndex = this.controller.storyDetail.get("storyIndex");
  this.controller.adjustForSlideWidthChange(storySlide, slideIndex,
    this.controller.getAnimatedElement("detailSlide"), this.controller.getAnimatedElement("storyDetail"), this.$el);
};

SlidePresenterBurrellDetail.prototype.snapToStory = function(slideIndex){
  //console.log("SlidePresenterBurrellDetail.snapToStory slideIndex %o", slideIndex);
  var newSlidePos = this.controller.getSlideOffsetFromZero(slideIndex, this.$el);
  //console.log("newSlidePos %o", newSlidePos);
  var storyAnimation = this.controller.getAnimatedElement("storyDetail");
  var storyEl = storyAnimation.options.el;
  //console.log("newSlidePos %o, storyAnimation %o, storyEl %o", newSlidePos, storyAnimation, storyEl[0]);

  //set the slide visually
  $(storyEl).css("left", -newSlidePos+"px");

  //set the model property
  var model = this.controller.storyDetail;
  this.controller.storyDetail.set("storyIndex", slideIndex);
  this.controller.storyDetail.trigger("change:storyIndex");
};

/*
SlidePresenterBurrellDetail.prototype.getSlideOffsetFromZero = function(slideIndex){
  var slideOffsetFromZero = 0;
  var sliderOffset = this.getSliderOffset();
  this.$el.find(".story").each(function(idx) {
    if (idx+1 <= slideIndex) {
      slideOffsetFromZero += $(this).width();
    };
  });
  return slideOffsetFromZero;
};

SlidePresenterBurrellDetail.prototype.getSliderOffset = function(){
  var sliderCSSLeft = this.$el.css("left");
  var offset = (sliderCSSLeft) ? -( sliderCSSLeft.substring(0, sliderCSSLeft.length-2) ) : 0;
  return offset;
};

SlidePresenterBurrellDetail.prototype.getSlideMoveOffset = function(slideIndex){
  var sliderOffset = this.getSliderOffset();
  var slideOffsetFromZero = this.getSlideOffsetFromZero(slideIndex);
  var totalSlide = slideOffsetFromZero - sliderOffset;
  return totalSlide;
};
*/

SlidePresenterBurrellDetail.prototype.goToSlide = function(slideIndex){
  //console.log("SlidePresenterBurrellDetail.goToSlide slideIndex %o", slideIndex);
  var quickDuration = 120;
  var navAnimation = this.controller.getAnimatedElement("detailNavLinks");
  var mainTextAnimation = this.controller.getAnimatedElement("detailMain");
  var itemNavAnimation = this.controller.getAnimatedElement("itemNav");
  var quoteAnimation = this.controller.getAnimatedElement("detailQuote");
  var storyAnimation = this.controller.getAnimatedElement("storyDetail");
  var totalSlide = this.controller.getSlideMoveOffset(slideIndex, this.$el);

  if (totalSlide != 0) {
    Animator.fadeOut(navAnimation.options.el, quickDuration);
    Animator.fadeOut(mainTextAnimation.options.el, quickDuration);
    Animator.fadeOut(itemNavAnimation.options.el, quickDuration);
    Animator.fadeOut(quoteAnimation.options.el, quickDuration);

    var waitForFades = setTimeout(function(){

      storyAnimation.options.animateProperties.left = "-="+totalSlide;

      storyAnimation.options.animateCallback = function(){

        Animator.fadeIn(navAnimation.options.el, navAnimation.options.duration);
        Animator.fadeIn(mainTextAnimation.options.el, mainTextAnimation.options.duration);
        Animator.fadeIn(itemNavAnimation.options.el, itemNavAnimation.options.duration);
        Animator.fadeIn(quoteAnimation.options.el, quoteAnimation.options.duration);

      };

      storyAnimation.startAnimation();

    }.bind(this), quickDuration+10);

  }

};


SlidePresenterBurrellDetail.prototype.updateActiveStateItemNav = function(slideIndex){
  //console.log("SlidePresenterBurrellDetail.updateActiveStateItemNav slideIndex %o", slideIndex);
  this.controller.$el.find(".item-navigation .nav-item a").removeClass("active").eq(slideIndex).addClass("active");
};
