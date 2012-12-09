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

  // Assure we have DOM before creating Presenters
  if (this.$el.length) {

    this.summaryPresenter = new SlidePresenterBurrellSummary({

      // Reference the controller/creator
      controller: this,

      //pass on the presentational behavior configurations
      autoRotate: this.options.autoRotate,
      circular: this.options.circular

    });

    this.detailPresenter = new SlidePresenterBurrellDetail({

      // Reference the controller/creator
      controller: this,

      //pass on the presentational behavior configurations
      autoRotate: this.options.autoRotate,
      circular: this.options.circular

    });

    this.setupViewport();

    if (this.autoRotate) {
      console.log("HeroSliderBurrell going to auto-rotate!");
      this.startAutoRotation();
    }

  }

};

HeroSliderBurrell.prototype.setupViewport = function(){

  // Model for the viewport size
  var viewportDims = this.getViewportDims();
  console.log("viewportDims %o", viewportDims);
  this.viewport = new BasicModel(viewportDims);

  // Resize the hero based on the viewport
  //this.resizeHero(viewportDims);

  //Subscribe to the change event on the model via the controller
  this.viewport.on("change", this.viewportChangeHandler.bind(this));

  //Bind the DOM event that updates the model
  $(window).resize(function(ev){
  //console.log("HeroSliderBurrell window resize this %o..", this);
    var viewportDims = this.getViewportDims();
    console.log("HeroSliderBurrell window resize to, h %o, %o", viewportDims.width, viewportDims.height);

    this.viewport.set(viewportDims);

    this.summaryPresenter.resizeBackgrounds(viewportDims);

  }.bind(this));
  //$(window).trigger("resize");
  this.viewport.trigger("change");

};

HeroSliderBurrell.prototype.getViewportDims = function(){
  var frameDims = Animator.getBoxDimensions(".everything");
  var windowDims = Animator.getBoxDimensions(window);
  return {
    width: frameDims.width,
    height: windowDims.height
  };
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
  //console.log("resizeHero with this.$el %o", this.$el);
  Animator.resizeBox(this.$el, {
    width: vp.width,
    //leave room for some content to 'peek' above the fold
    height: vp.height-100
  }, 0);
};


/* Presenter: Summary Slides */

var SlidePresenterBurrellSummary = function(options){
  SlidePresenter.call(this, options); //call super constructor
  this.$el = this.controller.$el;
  this.init();
};
SlidePresenterBurrellSummary.prototype = Object.create(SlidePresenter.prototype);
SlidePresenterBurrellSummary.prototype.parent = SlidePresenter.prototype;
SlidePresenterBurrellSummary.prototype.init = function() {
  // Call the parent init function
  this.parent.init.call(this);

  var storyCount;
  console.log("SlidePresenterBurrellSummary.init with this.$el %o", this.$el);
  if (this.$el) {
    storyCount = this.controller.$el.find(".slider-summary .story").length;
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
  "click .slider-summary a.go-detail": "detailClickHandler"
};

// DOM event handlers
SlidePresenterBurrellSummary.prototype.nextStoryClickHandler = function(ev){
  ev.preventDefault();
  console.log("SlidePresenterBurrellSummary.nextStoryClickHandler: this %o", this);
  console.log("SlidePresenterBurrellSummary.nextStoryClickHandler: this.controller %o", this.controller);
  this.controller.stopAutoRotation();
  this.controller.nextStory(this.controller.storySummary);
};

SlidePresenterBurrellSummary.prototype.previousStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.stopAutoRotation();
  this.controller.previousStory(this.controller.storySummary);
};

SlidePresenterBurrellSummary.prototype.detailClickHandler = function(ev){
  ev.preventDefault();
  var detailIndex = parseInt($(ev.target).attr("data-storyindex"));
  this.goToDetail(detailIndex)
};

// Data event handlers
SlidePresenterBurrellSummary.prototype.storyIndexChangeHandler = function(story) {
  console.log("SlidePresenterBurrellSummary.storyIndexChangeHandler for model %o", story);
  this.goToSlide(story.get("storyIndex"));
};

 SlidePresenterBurrellSummary.prototype.bindDataEvents = function(){
    //Subscribe to the change event on the model via the controller
  this.controller.storySummary.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
  //subscribe for all resize events instead of viewport change, since a min-width keeps the change from firing
  //this.controller.viewport.on("change", this.resizeBackgrounds.bind(this));
};

SlidePresenterBurrellSummary.prototype.goToSlide = function(slideIndex){
  console.log("SlidePresenterBurrellSummary.goToSlide slideIndex %o", slideIndex);
  var slideOffsetFromZero = 0;
  var sliderOffset = this.$el.find(".slider-fullsize.slider-summary").css("left");
  sliderOffset = -(sliderOffset.substring(0, sliderOffset.length-2));
  this.$el.find(".slider-summary .story").each(function(idx) {
    if (idx+1 <= slideIndex) {
      slideOffsetFromZero += $(this).width();
    }
  });
  console.log("SlidePresenterBurrellSummary.goToSlide sliderOffset %o, total slideOffsetFromZero %o", sliderOffset, slideOffsetFromZero);
  var totalSlide = slideOffsetFromZero - sliderOffset;
  console.log("SlidePresenterBurrellSummary.goToSlide total slide: %o", totalSlide);

  var navAnimation = this.controller.getAnimatedElement("summaryNav");
  navAnimation.options.animateProperties = { opacity: 0 };
  navAnimation.startAnimation();

  var storyAnimation = this.controller.getAnimatedElement("storySummary");
  storyAnimation.options.animateProperties.left = "-="+totalSlide;
  storyAnimation.options.animateCallback = function(){
    navAnimation.options.animateProperties = { opacity: 1 };
    navAnimation.startAnimation();
  };
  console.log("working with storyAnimation %o for element %o, totalSlide %o left", storyAnimation, storyAnimation.options.el[0], totalSlide);
  storyAnimation.startAnimation();

};

SlidePresenterBurrellSummary.prototype.goToDetail = function(slideIndex){
  this.controller.stopAutoRotation();
  console.log("SlidePresenterBurrellSummary.goToDetail %o", slideIndex);
  //set the detail story state
  if (typeof slideIndex === "number") {
    //via the Controller, The Detail Presenter sets this
    this.controller.detailPresenter.snapToStory(slideIndex);
  }

  this.hideDetailSlides();

  this.showSummarySlides();

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

SlidePresenterBurrellSummary.prototype.setupAnimatedElements = function(){

  this.controller.newAnimatedElement("summaryBackground", {
    el: this.$el.find(".slider-fullsize.slider-summary .background.summary"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("teaser", {
    el: this.$el.find(".slider-fullsize.slider-summary .teaser"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("teaserBackground", {
    el: this.$el.find(".slider-fullsize.slider-summary .background.teaser-background"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("storySummary", {
    el: this.$el.find(".slider-fullsize.slider-summary"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("storyDetail", {
    el: this.$el.find(".slider-fullsize.slider-detail"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("storySlide", {
    el: this.$el.find(".slider-fullsize.slider-summary .story"),
    animateDuration: 1000
  });

  this.controller.newAnimatedElement("summaryNav", {
    el: this.$el.find(".summary-navigation-left-right"),
    animateDuration: 400
  });

  //Setup resizables

  //Story slide
  this.storySlide = new BasicModel({
    width: 1000
  });
  this.storySlide.on("change", this.storySlideChangeHandler.bind(this));
  this.storySlide.set("width", $(".everything").width());

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
  var background = this.controller.getAnimatedElement("storySlide");
  Animator.resizeBox(background.$el, {
    width: storySlide.get("width")
  }, 0);

};

SlidePresenterBurrellSummary.prototype.summaryBackgroundChangeHandler = function(summaryBackground){
  var background = this.controller.getAnimatedElement("summaryBackground");
  Animator.resizeBox(background.$el, {
    width: summaryBackground.get("width"),
    height: summaryBackground.get("height")
  }, 0);

};

SlidePresenterBurrellSummary.prototype.teaserSizeChangeHandler = function(teaserBackground){
  //console.log("SlidePresenterBurrellSummary.teaserBackgroundChangeHandler with %o", teaserBackground);
  var teaser = this.controller.getAnimatedElement("teaserBackground");
  Animator.resizeBox(teaser.$el, {
    width: teaserBackground.get("width"),
    height: teaserBackground.get("height")
  }, 0);

  //Teaser box
  var teaserBox = this.controller.getAnimatedElement("teaser");
  Animator.resizeBox(teaserBox.$el, {
    width: teaserBackground.get("width"),
    height: teaserBackground.get("height")
  }, 0);

}

SlidePresenterBurrellSummary.prototype.getProportionalFit = function(b, a, prop1, prop2){
  // b is projected proportionally on a,
  // where b[prop1] / b[prop2] ratio is maintained

};

SlidePresenterBurrellSummary.prototype.resizeBackgrounds = function(vp){
  console.log("SlidePresenterBurrellSummary.resizeBackgrounds: set to width, height: %o, %o", vp.width, vp.height);
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
    fitChoice = fitByHeight;
  //square viewport: either fit types will fill it
  } else {
    //console.log("square viewport.");
    fitChoice = fitByWidth;
  }


  //set story width
  this.storySlide.set({ width: vp.width });

  //set proportional fit
  this.summaryBackground.set(fitChoice);

  //teaser ribbon size
  var teaserFit = { width: vp.width, height: vp.width/this.teaser.get("widthOrig")*this.teaser.get("heightOrig") };
  this.teaser.set(teaserFit);
};

/* Presenter: Detail Slides */
var SlidePresenterBurrellDetail = function(options){
  SlidePresenter.call(this, options); //call super constructor
  this.init();
};
SlidePresenterBurrellDetail.prototype = Object.create(SlidePresenter.prototype);
SlidePresenterBurrellDetail.prototype.parent = SlidePresenter.prototype;
SlidePresenterBurrellDetail.prototype.init = function() {
  // Call the parent init function
  this.parent.init.call(this);

  var storyCount;

  if (this.$el) {
    storyCount = this.$el.find(".slider-detail .story").length;
    if (storyCount) {
      //update story count on the Model
      this.controller.storyDetail.set("storyCount", storyCount);

      //register animated elements
      this.controller.newAnimatedElement("storyDetail", {
        el: this.$el.find(".slider-fullsize.slider-detail"),
        animateDuration: 1000
      });

      this.controller.newAnimatedElement("detailNav", {
        el: this.$el.find(".detail-navigation"),
        animateDuration: 200
      });

      this.controller.newAnimatedElement("itemNav", {
        el: this.$el.find(".item-navigation"),
        animateDuration: 200
      });
    }
  }
};
SlidePresenterBurrellDetail.prototype.events = {
  "click .detail-navigation .go-next": "nextStoryClickHandler",
  "click .detail-navigation .go-previous": "previousStoryClickHandler",
  "click .item-navigation .go-to-story": "goToClickHandler"
};

// DOM event handlers
SlidePresenterBurrellDetail.prototype.goToClickHandler = function(ev){
  ev.preventDefault();
  console.log("inspecting %o", $(ev.target).parent() );
  var storyIndex = $(ev.target).parent().attr("data-storyindex");
  console.log("Let's go storyIndex %o", storyIndex);
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
  //console.log("Calling stopAnimations %o", this.controller);
  this.controller.stopAnimations();
  this.goToSlide(story.get("storyIndex"));
  this.updateActiveStateItemNav(story.get("storyIndex"));
};

SlidePresenterBurrellDetail.prototype.bindDataEvents = function(){
  //Subscribe to the change event on the model via the controller
  this.controller.storyDetail.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
};

SlidePresenterBurrellDetail.prototype.snapToStory = function(slideIndex){
  //console.log("SlidePresenterBurrellDetail.snapToStory slideIndex %o", slideIndex);
  var newSlidePos = this.getSlideOffsetFromZero(slideIndex);
  var storyAnimation = this.controller.getAnimatedElement("storyDetail");
  storyEl = storyAnimation.options.el;

  //set the slide visually
  $(storyEl).css("left", -newSlidePos+"px");

  //set the model property
  var model = this.controller.storyDetail;
  this.controller.storyDetail.set("storyIndex", slideIndex);
};

SlidePresenterBurrellDetail.prototype.getSlideOffsetFromZero = function(slideIndex){
  var slideOffsetFromZero = 0;
  var sliderOffset = this.getSliderOffset();
  this.$el.find(".slider-detail .story").each(function(idx) {
    if (idx+1 <= slideIndex) {
      slideOffsetFromZero += $(this).width();
    };
  });
  return slideOffsetFromZero;
};

SlidePresenterBurrellDetail.prototype.getSliderOffset = function(slideIndex){
  var sliderOffset = this.$el.find(".slider-fullsize.slider-detail").css("left");
  return -( sliderOffset.substring(0, sliderOffset.length-2) );
};

SlidePresenterBurrellDetail.prototype.getSlideMoveOffset = function(slideIndex){
  var sliderOffset = this.getSliderOffset();
  var slideOffsetFromZero = this.getSlideOffsetFromZero(slideIndex);
  var totalSlide = slideOffsetFromZero - sliderOffset;
  return totalSlide;
};

SlidePresenterBurrellDetail.prototype.goToSlide = function(slideIndex){
  //console.log("SlidePresenterBurrellDetail.goToSlide slideIndex %o", slideIndex);

  var navAnimation = this.controller.getAnimatedElement("detailNav");
  navAnimation.options.animateProperties = { opacity: 0 };
  navAnimation.startAnimation();

  var storyAnimation = this.controller.getAnimatedElement("storyDetail");
  var totalSlide = this.getSlideMoveOffset(slideIndex);
  //console.log("totalSlide %o", totalSlide);
  if (totalSlide != 0) {
    storyAnimation.options.animateProperties.left = "-="+totalSlide;
    storyAnimation.options.animateCallback = function(){
      navAnimation.options.animateProperties = { opacity: 1 };
      navAnimation.startAnimation();
    };
    storyAnimation.startAnimation();
  }

};


SlidePresenterBurrellDetail.prototype.updateActiveStateItemNav = function(slideIndex){
  //console.log("SlidePresenterBurrellDetail.updateActiveStateItemNav slideIndex %o", slideIndex);
  this.$el.find(".item-navigation .nav-item a").removeClass("active").eq(slideIndex).addClass("active");
};
