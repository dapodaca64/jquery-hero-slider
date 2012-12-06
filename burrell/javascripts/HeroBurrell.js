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

  this.setupViewport();

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

    if (this.autoRotate) {
      console.log("HeroSliderBurrell going to auto-rotate!");
      this.startAutoRotation();
    }

  }

};

HeroSliderBurrell.prototype.setupViewport = function(){

  // Model for the viewport size
  var viewportDims = Animator.getBoxDimensions(window);
  this.viewport = new BasicModel({
    width: viewportDims.width,
    height: viewportDims.height
  });

  // Resize the hero based on the viewport
  this.resizeHero(viewportDims);

  //Subscribe to the change event on the model via the controller
  this.viewport.on("change", this.viewportChangeHandler.bind(this));

  //Bind the DOM event that updates the model
  $(window).resize(function(ev){
  console.log("HeroSliderBurrell.window resize this %o..", this);
    var viewportDims = Animator.getBoxDimensions(window);
    this.viewport.set({
      width: viewportDims.width,
      height: viewportDims.height
    });
  }.bind(this));

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
  console.log("HeroSliderBurrell.viewportChangeHandler(%o) this %o", viewport, this);
  this.resizeHero(viewport);
};

HeroSliderBurrell.prototype.resizeHero = function(vp){
  this.$el.css({
    backgroundColor: "red"
  });
  Animator.resizeBox(this.$el, {
    width: vp.width,
    height: vp.height
  }, 0);
};



/* Summary Slides Presenter */

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
  console.log("this.$el %o", this.$el);
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
  this.controller.viewport.on("change", this.resizeBackgrounds.bind(this));
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
  /*
  detailAnimation.options.animateProperties = { opacity: 1 };
  detailAnimation.options.animateCallback = function(){ };
  $(detailAnimation.options.el).css({ opacity: 0, display: "block" });
  detailAnimation.startAnimation();
  */


  this.showSummarySlides();
  /*
  summaryAnimation.options.animateProperties = { opacity: 0 };
  summaryAnimation.options.animateCallback = function(){
    $(summaryAnimation.options.el).hide();
  };
  summaryAnimation.startAnimation();
  */

  this.hideSummaryNav();

  this.showDetailNav();
  /*
  detailNavAnimation.options.el.css({ opacity: "0", display: "block" });
  detailNavAnimation.options.animateProperties = { opacity: 1 };
  detailNavAnimation.options.animateCallback = function(){ };
  detailNavAnimation.startAnimation();
  */

  this.showItemNav();
  /*
  itemNavAnimation.options.el.css({ opacity: "0", display: "block" });
  itemNavAnimation.options.animateProperties = { opacity: 1 };
  itemNavAnimation.options.animateCallback = function(){ };
  itemNavAnimation.startAnimation();
  */
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

  console.log("SlidePresenterBurrellSummary.setupAnimatedElements..");
  this.controller.newAnimatedElement("summaryBackground", {
    el: this.$el.find(".slider-fullsize.slider-summary .background.summary"),
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

  this.controller.newAnimatedElement("summaryNav", {
    el: this.$el.find(".summary-navigation-left-right"),
    animateDuration: 400
  });

  var viewportDims = Animator.getBoxDimensions(window);
  this.resizeBackgrounds(viewportDims);

};

SlidePresenterBurrellSummary.prototype.resizeBackgrounds = function(vp){
  var background = this.controller.getAnimatedElement("summaryBackground")
  console.log("background.$el %o", background.$el);
  console.log("set to width: %o, height: %o", vp.width, vp.height);
  Animator.resizeBox(background.$el, {
    width: vp.width,
    height: vp.height
  }, 0);

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
  console.log("SlidePresenterBurrellDetail.storyIndexChangeHandler for model %o", story);
  console.log("Calling stopAnimations %o", this.controller);
  this.controller.stopAnimations();
  this.goToSlide(story.get("storyIndex"));
  this.updateActiveStateItemNav(story.get("storyIndex"));
};

SlidePresenterBurrellDetail.prototype.bindDataEvents = function(){
  //Subscribe to the change event on the model via the controller
  this.controller.storyDetail.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
};

SlidePresenterBurrellDetail.prototype.snapToStory = function(slideIndex){
  console.log("SlidePresenterBurrellDetail.snapToStory slideIndex %o", slideIndex);
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
  console.log("totalSlide %o", totalSlide);
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
  console.log("SlidePresenterBurrellDetail.updateActiveStateItemNav slideIndex %o", slideIndex);
  this.$el.find(".item-navigation .nav-item a").removeClass("active").eq(slideIndex).addClass("active");
};
