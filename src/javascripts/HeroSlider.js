$ = jQuery;

// Shim
// Inheritance that is more like other OOP, proposed by Crockford
if (typeof Object.create !== "function") {
  Object.create = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
}

// Basic model for managing data with attributes
// Built-in event pub/sub
var BasicModel = function(attributes){
  // Previous attributes key/val store
  this.previous = { };
  for (var i in attributes) {
    this[i] = attributes[i];
    this.previous[i] = attributes[i];
  }
  // Subscriptions key/val store
  // For binding data events
  this.subscriptions = { };
};

BasicModel.prototype.get = function(property){
  return this[property];
};

BasicModel.prototype.set = function(property, value){
  this.previous[property] = this[property];
  this[property] = value;
  if (value != this.previous[property]) {
    this.trigger("change");
    this.trigger("change:"+property);
  }
  return this[property] = value;
};

BasicModel.prototype.trigger = function(triggerName) {
  //publish this event
  if (this.subscriptions[triggerName]) {
    for (var i=0, j=this.subscriptions[triggerName].length; i<j; i++) {
      var subscription = this.subscriptions[triggerName][i];
      subscription.call(subscription, this);
    }
  }
};

BasicModel.prototype.on = function(triggerName, callback) {
  if (!this.subscriptions[triggerName]) {
    this.subscriptions[triggerName] = [ ];
  }
  var alreadySubscribed = false;
  for (var i=0, j=this.subscriptions[triggerName].length; i<j; i++) {
    if (this.subscriptions[triggerName][i] == callback) {
      alreadySubscribed = true;
    }
  }
  if (!alreadySubscribed) {
    this.subscriptions[triggerName].push(callback);
  }
};

BasicModel.prototype.off = function(triggerName, callback) {
  if (callback) {
    for (var i=0, j=this.subscriptions[triggerName].length; i<j; i++) {
      if (this.subscriptions[triggerName][i] == callback) {
        this.subscriptions[triggerName] = this.subscriptions[triggerName].splice(i, 1);
      }
    }
  } else {
    this.subscriptions[triggerName] = [ ];
  }
};

//Interface to jQuery animation APIs
var Animator = {
  startAnimation: function(el, properties, options){
    $(el).animate(properties, options.duration, options.easing, options.callback);
  },
  stopAnimation: function(el){
    $(el).stop();
  },
  deQueueAnimation: function(el, queueName){
    $(el).dequeue(queueName);
  },
  getAnimationQueue: function(el, queueName){
    return $(el).queue(queueName);
  },
  fadeIn: function(el, duration, callback){
    $(el).fadeIn(duration, callback);
  },
  fadeOut: function(el, duration, callback){
    $(el).fadeOut(duration, callback);
  }
}

//General Animation Controller for one DOM element
var AnimatedElement = function(options){

  var defaults = {
    el: false,
    animateProperties: {
      //left: "+=200",
      queueName: "fx"
    },
    animateDuration: 5000,
    animateEasing: 'swing',
    animateCallback: function() {
      console.log("animation for element complete.");
    },
  };

  this.options = $.extend({}, defaults, options);
  this.el = this.options.el;
  this.isPlaying = false;

  this.startAnimation = function(){
    //console.log("AnimatedElement.startAnimation...");
    //internal check
    this.isPlaying = true;

    //external interface
    Animator.startAnimation(this.el, this.options.animateProperties, {
      duration: this.options.animateDuration,
      easing: this.options.animateEasing,
      callback: this.options.animateCallback
    });
  };

  this.stopAnimation = function(){
    //internal check
    this.isPlaying = false;

    //external interface
    Animator.stopAnimation(this.el);
  };

  this.deQueueAnimation = function(){
    //external interface
    Animator.deQueueAnimation(this.el, this.options.animateProperties.queueName);
  };

  this.getAnimationQueue = function(){
    //external interface
    return Animator.getAnimationQueue(this.el, this.options.animateProperties.queueName);
  };

};


// HeroSlider. A Controller for managing a set of slides
//
// The Controller sets up the Presenters
//
// The Presenters contain presentational and animation logic
//
// The Controller sets up single Model, representing
//   the slideIndex, and the layoutMode
//   of "default" and "detail" (coupled) states
//   of each slide/story
//
// The Controller allows the Presenter to Access the Model

var HeroSlider = function(options){
  var defaults = {
    el: false,
    autoRotate: true,
    autoRotateWait: 5000,
    circular: true //continuous loop through the stories
  };
  this.options = $.extend({}, defaults, options);

  // Our DOM scope
  this.el = this.options.el;
  //console.log("HeroSlider.init: this.el %o", this.el);

  // Initial behaviors
  // Let's be very deliberate about this configuration
  this.autoRotate = this.options.autoRotate;
  this.circular = this.options.circular;

  // Initial collection of animated objects
  // Used as a key/value store
  this.animatedEls = { };

};

HeroSlider.prototype.run = function(){
  if (this.autoRotate) {
    this.startAnimations();
  };
};

HeroSlider.prototype.goToStory = function(model, storyIndex){
  console.log("HeroSlider.goToStory: %o", storyIndex);
  model.set("storyIndex", +(storyIndex));
};

HeroSlider.prototype.nextStory = function(model){
  console.log("HeroSlider.nextStory: storyIndex %o storyCount %o", model.get("storyIndex"), model.get("storyCount"));
  var storyIndex = model.get("storyIndex");
  if (storyIndex + 1 == model.get("storyCount")) {
    model.set("storyIndex", 0);
  } else {
    model.set("storyIndex", storyIndex + 1);
  }
};

HeroSlider.prototype.previousStory = function(model){
  //console.log("HeroSlider.previousStory: storyIndex %o storyCount %o", model.get("storyIndex"), model.get("storyCount"));
  var storyIndex = model.get("storyIndex");
  if (storyIndex == 0) {
    //update the model
    model.set("storyIndex", model.get("storyCount") - 1);
  } else {
    //update the model
    model.set("storyIndex", storyIndex - 1);
  }
};

HeroSlider.prototype.layoutModeToggle = function(){
  console.log("HeroSlider.layoutModeToggle");
  var layoutMode = (this.story.get("layoutMode") === "default") ? "detail" : "default";
  //update the model
  this.story.set("layoutMode", layoutMode);
};

HeroSlider.prototype.isPlaying = function(){
  for (var i in this.animatedEls) {
    if (this.animatedEls[i].isPlaying) {
      return true;
    }
  }
  return false;
};

HeroSlider.prototype.newAnimatedElement = function(name, options) {
  var ae = new AnimatedElement(options);
  this.animatedEls[name] = ae;
  return this.animatedEls[name];
};

HeroSlider.prototype.getAnimatedElement = function(name) {
  return this.animatedEls[name] || false;
};

HeroSlider.prototype.stopAnimations = function(){
  //console.log("HeroSlider.stopAnimations...");
  for (var i in this.animatedEls) {
    this.animatedEls[i].stopAnimation();
  }
};

HeroSlider.prototype.startAnimations = function(){
  //console.log("HeroSlider.startAnimations...");
  this.deQueueAnimations();
  for (var i in this.animatedEls) {
    this.animatedEls[i].startAnimation();
  }
};

HeroSlider.prototype.deQueueAnimations = function(){
  //console.log("HeroSlider.deQueueAnimation...");
  for (var i in this.animatedEls) {
    this.animatedEls[i].deQueueAnimation();
  }
};

HeroSlider.prototype.getAnimationQueues = function(){
  //console.log("HeroSlider.getAnimationQueues...");
  var queues = [ ];
  for (var i in this.animatedEls) {
    queues.push(this.animatedEls[i].getAnimationQueue());
  }
  return queues;
};

// SlidePresenter: A Presenter for slides, an interface to the View
//
// Each Presenter manages a single set of slides,
//  within the context of a DOM element representing the View
//
// The Presenter contains the presentational logic by
//   defining what the animations are, and running them
//   as an animation controller.
//
// Event Configuration:
// The Presenter also specifies the events by relating the
//   event to the DOM and its associated handler
//
// Event Delegation:
// The Presenter binds each event type to the View's DOM scope
// And delegates to the handler.
// TODO: Currently it requires an exact match between the event
//   target and the DOM selector in the Event Configuration.
//
// The Presenter also defines its own DOM and data event handlers.
//
// The Model is accessed via Application Controller HeroSlider

var SlidePresenter = function(options) {
  this.$el = $(options.controller.el);
  this.controller = options.controller;
};

SlidePresenter.prototype.init = function(){
  //console.log("SlidePresenter.init...");
  this.bindDOMEvents();
  this.bindDataEvents();
};

SlidePresenter.prototype.events = {
  //"click a.next": "nextClickHandler",
};

SlidePresenter.prototype.parseEvents = function(){
  //access the events and categorize by event type
  var eventTypes = { };
  for (var entry in this.events) {
    var eType = false, eHandler = false, eSelector;

    try {

      var eventPairing = entry.split(" ");
      eType = eventPairing.shift();
      eSelector = eventPairing.join(" ");
      eHandler = this.events[entry];

    } catch (e) {

      console.log("SlidePresenter Parse Error: Expected value for event type or handler.");
    }

    if (eType && eHandler && eSelector) {

      //categorizing events by event type
      //into collections

      //create collection if first entry
      if (!eventTypes[eType]) {
        eventTypes[eType] = [ ];
      }

      //add event selector/handler pair
      //into category collection
      eventTypes[eType].push({
        selector: eSelector,
        handler: eHandler
      });

    }
  }
  return eventTypes;
};

SlidePresenter.prototype.bindDataEvents = function(){
  //Subscribe to the change event on the model via the controller
  //this.controller.story.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
};

SlidePresenter.prototype.bindDOMEvents = function(){
  // Get events categorized by event type
  var eventsByType = this.parseEvents();

  var self = this;
  for (var eventType in eventsByType) {
    this.$el.on(eventType, function(ev){
      self.delegateEvent(ev, eventsByType[eventType]);
    });
  }

};

SlidePresenter.prototype.isElementInCollection = function(el, selector) {
  var isInCollection = false;
  $(selector).each(function(){
    var test = (el == this);
    //console.log("isElement el %o same as %o? %o", el, this, test);
    if (el == this) {
      isInCollection = true;
    }
  });
  return isInCollection;
};

SlidePresenter.prototype.delegateEvent = function(ev, delegates) {
  //console.log("ev.currentTarget %o, ev.target %o", ev.currentTarget, ev.target);
  for (delegate in delegates) {
    // Is the event target in the elements that match the selector?
    //console.log("SlidePresenter.delegateEvent ev %o", ev);
    var inCollection = this.isElementInCollection(ev.target, delegates[delegate].selector);
    //console.log("inCollection? %o", inCollection);
    if (inCollection) {
      // Fire the event handler
      try {
        this[delegates[delegate].handler].call(this, ev);
      } catch(e) {
        console.log("SlidePresenter Error in event delegation: Cannot call function %o", this[delegates[delegate].handler]);
      }
    }
  }
};

// Example Usage: HeroSlider Controller
//
// Example A: One Controller manages a single set of slides.
//            Each slide has a coupled detail state.
//
// The Controller sets up the Presenters
//   The Presenters contain presentational and animation logic
//
// The Controller sets up single Model, representing
//   the slideIndex, and the layoutMode
//   of "default" and "detail" (coupled) states
//   of each slide/story
//
// The Controller allows the Presenter to Access the Model

var HeroSliderExampleA = function(options){
  HeroSlider.call(this, options); //call super constructor
};

HeroSliderExampleA.prototype = Object.create(HeroSlider.prototype);

HeroSliderExampleA.prototype.init = function(){
  //console.log("HeroSliderExampleB init runs with this %o", this);
  // A Model. Is there better to place for this?
  // It supports get/set of attributes
  // And binding to data events
  this.story = new BasicModel({
    storyIndex: 0,
    storyCount: 0,
    layoutMode: "default" // "default" or "detail"
  });

  // When DOM
  if (this.el) {

    this.slidePresenter = new SlidePresenterExampleA({

      // Reference the controller/creator, HeroSlider
      controller: this,

      //pass on the presentational behavior configurations
      autoRotate: this.options.autoRotate,
      circular: this.options.circular

    });

  // When testing
  // TODO: Might be possible to do everything in test setup and teardown
  } else {

    //static default
    this.story.set("storyCount", 5);

  }
};

// Example Usage: SlidePresenter
//
// Example A: One Presenter manages a single set of slides.
//            Each slide has a coupled detail state.
//
// The Presenter contains the presentational logic by
//   defining what the animations are, and running them
//   as an animation controller.
//
// The Presenter also specifies the events by relating the
//   event to the DOM and its associated handler
//
// The Presenter also defines its own DOM and data event handlers.
//
// The Presenter Example A interacts with a single model representing
//   the slideIndex, and the layoutMode
//   of "default" and "detail" (coupled) states
//   of each slide/story
//
// The Model is accessed via Application Controller HeroSlider

var SlidePresenterExampleA = function(options){
  SlidePresenter.call(this, options); //call super constructor
  this.init();
};

SlidePresenterExampleA.prototype = Object.create(SlidePresenter.prototype);

SlidePresenterExampleA.prototype.parent = SlidePresenter.prototype;

SlidePresenterExampleA.prototype.init = function(){

  //console.log("SlidePresenterExampleA.init.. with controller", this.controller);
  var storyCount;
  if (this.$el) {
    storyCount = this.$el.find(".story").length;
    if (storyCount) {
      this.controller.story.set("storyCount", storyCount);

      //register animated elements
      this.controller.newAnimatedElement("story", {
        el: this.$el.find(".slider-fullsize"),
        animateDuration: 1000
      });

      this.$el.find(".teaser-navigation a").css("opacity", 1);
      this.controller.newAnimatedElement("teaserNav", {
        el: this.$el.find(".teaser-navigation a"),
        animateDuration: 600
      });

      this.$el.find(".item-navigation").css("opacity", 0);
      this.controller.newAnimatedElement("detailItemNav", {
        el: this.$el.find(".item-navigation"),
        animateDuration: 800
      });

      this.$el.find(".detail-navigation").css("opacity", 0);
      this.controller.newAnimatedElement("detailNav", {
        el: this.$el.find(".detail-navigation"),
        animateDuration: 600
      });

      this.$el.find(".mode-navigation").css("opacity", 0);
      this.controller.newAnimatedElement("detailClose", {
        el: this.$el.find(".mode-navigation"),
        animateDuration: 800
      });

      this.$el.find(".detail").css("opacity", 0);
      this.controller.newAnimatedElement("detailPanes", {
        el: this.$el.find(".detail"),
        animateDuration: 800
      });

      this.$el.find(".teaser").css("opacity", 1);
      this.controller.newAnimatedElement("teaserPanes", {
        el: this.$el.find(".teaser"),
        animateDuration: 800
      });

    }
    //call the parent init method
    this.parent.init.call(this);
  }
};

SlidePresenterExampleA.prototype.events = {
  "click a.story-detail": "layoutModeToggleClickHandler",
  "click a.story-toggle-mode": "layoutModeToggleClickHandler",
  "click a.story-detail-nav .nav-icon": "goToClickHandler",
  "click .teaser-navigation a.go-previous": "previousStoryClickHandler",
  "click .teaser-navigation a.go-next": "nextStoryClickHandler",
  "click .detail-navigation a.go-previous": "previousStoryClickHandler",
  "click .detail-navigation a.go-next": "nextStoryClickHandler"
};

// DOM event handlers
SlidePresenterExampleA.prototype.layoutModeToggleClickHandler = function(ev){
  ev.preventDefault();
  this.controller.layoutModeToggle();
};

SlidePresenterExampleA.prototype.goToClickHandler = function(ev){
  ev.preventDefault();
  this.controller.stopAutoRotation();
  console.log("inspecting %o", $(ev.target).parent() );
  var storyIndex = $(ev.target).parent().attr("data-storyindex");
  console.log("Let's go storyIndex %o", storyIndex);
  this.controller.goToStory(this.controller.story, storyIndex);
};

SlidePresenterExampleA.prototype.nextStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.stopAutoRotation();
  this.controller.nextStory(this.controller.story);
};

SlidePresenterExampleA.prototype.previousStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.stopAutoRotation();
  this.controller.previousStory(this.controller.story);
};


// Data event handlers
SlidePresenterExampleA.prototype.storyIndexChangeHandler = function(story) {
  console.log("SlidePresenterExampleA.storyIndexChangeHandler for model %o", story);
  this.goToSlide(story.get("storyIndex"));
};

SlidePresenterExampleA.prototype.storyLayoutChangeHandler = function(story) {
  console.log("SlidePresenterExampleA.storyLayoutChangeHandler for model %o", story);
  this.switchLayoutMode(story.get("layoutMode"));
};

SlidePresenterExampleA.prototype.bindDataEvents = function(){
  //Subscribe to the change event on the model via the controller
  this.controller.story.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
  this.controller.story.on("change:layoutMode", this.storyLayoutChangeHandler.bind(this));
};

SlidePresenterExampleA.prototype.goToSlide = function(slideIndex){
  console.log("SlidePresenterExampleA.goToSlide slideIndex %o", slideIndex);
  var slideOffsetFromZero = 0;
  var sliderOffset = this.$el.find(".slider-fullsize").css("left");
  sliderOffset = -(sliderOffset.substring(0, sliderOffset.length-2));
  this.$el.find(".story").each(function(idx) {
    if (idx+1 <= slideIndex) {
      slideOffsetFromZero += $(this).width();
    };
  });
  //console.log("sliderOffset %o, total slideOffsetFromZero %o", sliderOffset, slideOffsetFromZero);
  var totalSlide = slideOffsetFromZero - sliderOffset;
  //console.log("total slide: %o", totalSlide);

  console.log("mode %o", this.controller.story.get("layoutMode") );
  var navAnimation;
  var mode = this.controller.story.get("layoutMode");
  if (mode === "default") {
    navAnimation = this.controller.getAnimatedElement("teaserNav");
  } else if (mode === "detail") {
    navAnimation = this.controller.getAnimatedElement("detailNav");
  }
  navAnimation.options.animateProperties = { opacity: 0 };
  navAnimation.startAnimation();

  var storyAnimation = this.controller.getAnimatedElement("story");
  storyAnimation.options.animateProperties.left = "-="+totalSlide;
  storyAnimation.options.animateCallback = function(){
    navAnimation.options.animateProperties = { opacity: 1 };
    navAnimation.startAnimation();
  };
  storyAnimation.startAnimation();

  // Use controller to run animations in parallel set
  //this.controller.startAnimations();
};

SlidePresenterExampleA.prototype.switchLayoutMode = function(mode){
  console.log("SlidePresenterExampleA.switchLayoutMode %o", mode);
  var detailAnimation = this.controller.getAnimatedElement("detailPanes");
  var detailNavItemAnimation = this.controller.getAnimatedElement("detailItemNav");
  var detailNavAnimation = this.controller.getAnimatedElement("detailNav");
  var detailCloseAnimation = this.controller.getAnimatedElement("detailClose");
  var teaserAnimation = this.controller.getAnimatedElement("teaserPanes");
  var teaserNavAnimation = this.controller.getAnimatedElement("teaserNav");

  var self = this;

  if (mode === "default") {
    console.log("SlidePresenterExampleA.switchLayoutMode to default.");

    detailAnimation.options.animateProperties = { opacity: 0 };
    detailAnimation.options.animateCallback = function(){
      self.$el.find(".detail").hide();
    };
    detailAnimation.startAnimation();

    detailNavItemAnimation.options.animateProperties = { opacity: 0 };
    detailNavItemAnimation.options.animateCallback = function(){
      self.$el.find(".item-navigation").hide();
    };
    detailNavItemAnimation.startAnimation();

    detailNavAnimation.options.animateProperties = { opacity: 0 };
    detailNavAnimation.options.animateCallback = function(){
      self.$el.find(".detail-navigation").hide();
    };
    detailNavAnimation.startAnimation();

    detailCloseAnimation.options.animateProperties = { opacity: 0 };
    detailCloseAnimation.options.animateCallback = function(){
      self.$el.find(".mode-navigation").hide();
    };
    detailCloseAnimation.startAnimation();

    this.$el.find(".teaser").show();
    teaserAnimation.options.animateProperties = { opacity: 1 };
    teaserAnimation.options.animateCallback = function() { };
    teaserAnimation.startAnimation();

    this.$el.find(".teaser-navigation").show();
    teaserNavAnimation.options.animateProperties = { opacity: 1 };
    teaserNavAnimation.options.animateCallback = function() { };
    teaserNavAnimation.startAnimation();

  } else if (mode === "detail") {
    console.log("SlidePresenterExampleA.switchLayoutMode to detail.");

    this.$el.find(".detail").show();
    detailAnimation.options.animateProperties = { opacity: 1 };
    detailAnimation.options.animateCallback = function(){ };
    detailAnimation.startAnimation();

    this.$el.find(".item-navigation").show();
    detailNavItemAnimation.options.animateProperties = { opacity: 1 };
    detailNavItemAnimation.options.animateCallback = function(){  };
    detailNavItemAnimation.startAnimation();

    this.$el.find(".mode-navigation").show();
    detailCloseAnimation.options.animateProperties = { opacity: 1 };
    detailCloseAnimation.options.animateCallback = function(){ };
    detailCloseAnimation.startAnimation();

    this.$el.find(".detail-navigation").show();
    detailNavAnimation.options.animateProperties = { opacity: 1 };
    detailNavAnimation.options.animateCallback = function(){ };
    detailNavAnimation.startAnimation();

    teaserAnimation.options.animateProperties = { opacity: 0 };
    teaserAnimation.options.animateCallback = function(){
      self.$el.find(".teaser").hide();
    };
    teaserAnimation.startAnimation();

    teaserNavAnimation.options.animateProperties = { opacity: 0 };
    teaserNavAnimation.options.animateCallback = function(){
      self.$el.find(".teaser-navigation").hide();
    };
    teaserNavAnimation.startAnimation();

  }
};

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

var HeroSliderExampleB = function(options){
  HeroSlider.call(this, options); //call super constructor
};

HeroSliderExampleB.prototype = Object.create(HeroSlider.prototype);

HeroSliderExampleB.prototype.init = function(){
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
  if (this.el) {

    this.summaryPresenter = new SlidePresenterExampleBSummary({

      // Reference the controller/creator
      controller: this,

      //pass on the presentational behavior configurations
      autoRotate: this.options.autoRotate,
      circular: this.options.circular

    });

    this.detailPresenter = new SlidePresenterExampleBDetail({

      // Reference the controller/creator
      controller: this,

      //pass on the presentational behavior configurations
      autoRotate: this.options.autoRotate,
      circular: this.options.circular

    });

    if (this.autoRotate) {
      console.log("HeroSliderExampleB going to auto-rotate!");
      this.startAutoRotation();
    }
  }

};

HeroSliderExampleB.prototype.startAutoRotation = function(){
  this.setRotateTimeout();
};

HeroSliderExampleB.prototype.stopAutoRotation = function(){
  this.stopRotateTimeout();
};

HeroSliderExampleB.prototype.setRotateTimeout = function(){
  this.rotateTimeout = setTimeout(function(){
    this.nextStory(this.storySummary);
    this.setRotateTimeout();
  }.bind(this), this.options.autoRotateWait);
};

HeroSliderExampleB.prototype.stopRotateTimeout = function(){
  if (this.rotateTimeout) {
    clearTimeout(this.rotateTimeout);
  }
};

var SlidePresenterExampleBSummary = function(options){
  SlidePresenter.call(this, options); //call super constructor
  this.init();
};
SlidePresenterExampleBSummary.prototype = Object.create(SlidePresenter.prototype);
SlidePresenterExampleBSummary.prototype.parent = SlidePresenter.prototype;
SlidePresenterExampleBSummary.prototype.init = function() {
  // Call the parent init function
  this.parent.init.call(this);

  var storyCount;
  if (this.$el) {
    storyCount = this.$el.find(".slider-summary .story").length;
    if (storyCount) {
      //update story count on the Model
      this.controller.storySummary.set("storyCount", storyCount);

      //register animated elements
      this.controller.newAnimatedElement("storySummary", {
        el: this.$el.find(".slider-fullsize.slider-summary"),
        animateDuration: 1000
      });

      this.controller.newAnimatedElement("storyDetail", {
        el: this.$el.find(".slider-fullsize.slider-detail"),
        animateDuration: 1000
      });

      this.controller.newAnimatedElement("summaryNav", {
        el: this.$el.find(".summary-navigation"),
        animateDuration: 400
      });

    }
  }
};
SlidePresenterExampleBSummary.prototype.events = {
  "click .summary-navigation a.go-next": "nextStoryClickHandler",
  "click .summary-navigation a.go-previous": "previousStoryClickHandler",
  "click .slider-summary a.go-detail": "detailClickHandler"
};

// DOM event handlers
SlidePresenterExampleBSummary.prototype.nextStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.stopAutoRotation();
  console.log("SlidePresenterExampleBSummary.nextStoryClickHandler: this %o", this);
  console.log("SlidePresenterExampleBSummary.nextStoryClickHandler: this.controller %o", this.controller);

  this.controller.nextStory(this.controller.storySummary);
};

SlidePresenterExampleBSummary.prototype.previousStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.stopAutoRotation();
  this.controller.previousStory(this.controller.storySummary);
};

SlidePresenterExampleBSummary.prototype.detailClickHandler = function(ev){
  ev.preventDefault();
  this.controller.stopAutoRotation();
  var detailIndex = parseInt($(ev.target).attr("data-storyindex"));
  this.goToDetail(detailIndex)
};

// Data event handlers
SlidePresenterExampleBSummary.prototype.storyIndexChangeHandler = function(story) {
  console.log("SlidePresenterExampleBSummary.storyIndexChangeHandler for model %o", story);
  this.goToSlide(story.get("storyIndex"));
};

SlidePresenterExampleBSummary.prototype.bindDataEvents = function(){
  //Subscribe to the change event on the model via the controller
  this.controller.storySummary.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
};

SlidePresenterExampleBSummary.prototype.goToSlide = function(slideIndex){
  console.log("SlidePresenterExampleBSummary.goToSlide slideIndex %o", slideIndex);
  var slideOffsetFromZero = 0;
  var sliderOffset = this.$el.find(".slider-fullsize.slider-summary").css("left");
  sliderOffset = -(sliderOffset.substring(0, sliderOffset.length-2));
  this.$el.find(".slider-summary .story").each(function(idx) {
    if (idx+1 <= slideIndex) {
      slideOffsetFromZero += $(this).width();
    };
  });
  console.log("SlidePresenterExampleBSummary.goToSlide sliderOffset %o, total slideOffsetFromZero %o", sliderOffset, slideOffsetFromZero);
  var totalSlide = slideOffsetFromZero - sliderOffset;
  console.log("SlidePresenterExampleBSummary.goToSlide total slide: %o", totalSlide);

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

SlidePresenterExampleBSummary.prototype.goToDetail = function(slideIndex){
  console.log("SlidePresenterExampleBSummary.goToDetail %o", slideIndex);
  //set the detail story state
  if (typeof slideIndex === "number") {
    //via the Controller, The Detail Presenter sets this
    this.controller.detailPresenter.snapToStory(slideIndex);
  }
  var detailAnimation = this.controller.getAnimatedElement("storyDetail");
  var summaryAnimation = this.controller.getAnimatedElement("storySummary");
  var detailNavAnimation = this.controller.getAnimatedElement("detailNav");
  var summaryNavAnimation = this.controller.getAnimatedElement("summaryNav");
  var itemNavAnimation = this.controller.getAnimatedElement("itemNav");

  console.log("itemNavAnimation %o on el %o", itemNavAnimation, itemNavAnimation.options.el[0]);
  console.log("detailNavAnimation %o on el %o", detailNavAnimation, detailNavAnimation.options.el[0]);
  console.log("summaryNavAnimation %o on el %o", summaryNavAnimation, summaryNavAnimation.options.el[0]);

  detailAnimation.options.animateProperties = { opacity: 1 };
  detailAnimation.options.animateCallback = function(){ };

  summaryAnimation.options.animateProperties = { opacity: 0 };
  summaryAnimation.options.animateCallback = function(){
    $(summaryAnimation.options.el).hide();
  };
  summaryAnimation.startAnimation();

  $(detailAnimation.options.el).css({ opacity: 0, display: "block" });
  detailAnimation.startAnimation();

  summaryNavAnimation.options.animateProperties = { opacity: 0 };
  summaryNavAnimation.options.animateCallback = function(){
    $(summaryNavAnimation.options.el).hide();
  };
  summaryNavAnimation.startAnimation();

  detailNavAnimation.options.el.css({ opacity: "0", display: "block" });
  detailNavAnimation.options.animateProperties = { opacity: 1 };
  detailNavAnimation.options.animateCallback = function(){ };
  detailNavAnimation.startAnimation();

  itemNavAnimation.options.el.css({ opacity: "0", display: "block" });
  itemNavAnimation.options.animateProperties = { opacity: 1 };
  itemNavAnimation.options.animateCallback = function(){ };
  itemNavAnimation.startAnimation();
};

var SlidePresenterExampleBDetail = function(options){
  SlidePresenter.call(this, options); //call super constructor
  this.init();
};
SlidePresenterExampleBDetail.prototype = Object.create(SlidePresenter.prototype);
SlidePresenterExampleBDetail.prototype.parent = SlidePresenter.prototype;
SlidePresenterExampleBDetail.prototype.init = function() {
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
SlidePresenterExampleBDetail.prototype.events = {
  "click .detail-navigation .go-next": "nextStoryClickHandler",
  "click .detail-navigation .go-previous": "previousStoryClickHandler",
  "click .item-navigation .go-to-story": "goToClickHandler"
};

// DOM event handlers
SlidePresenterExampleBDetail.prototype.goToClickHandler = function(ev){
  ev.preventDefault();
  console.log("inspecting %o", $(ev.target).parent() );
  var storyIndex = $(ev.target).parent().attr("data-storyindex");
  console.log("Let's go storyIndex %o", storyIndex);
  this.controller.goToStory(this.controller.storyDetail, storyIndex);
};

SlidePresenterExampleBDetail.prototype.nextStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.nextStory(this.controller.storyDetail);
};

SlidePresenterExampleBDetail.prototype.previousStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.previousStory(this.controller.storyDetail);
};


// Data event handlers
SlidePresenterExampleBDetail.prototype.storyIndexChangeHandler = function(story) {
  console.log("SlidePresenterExampleBDetail.storyIndexChangeHandler for model %o", story);
  console.log("Calling stopAnimations %o", this.controller);
  this.controller.stopAnimations();
  this.goToSlide(story.get("storyIndex"));
  this.updateActiveStateItemNav(story.get("storyIndex"));
};

SlidePresenterExampleBDetail.prototype.bindDataEvents = function(){
  //Subscribe to the change event on the model via the controller
  this.controller.storyDetail.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
};

SlidePresenterExampleBDetail.prototype.snapToStory = function(slideIndex){
  console.log("SlidePresenterExampleBDetail.snapToStory slideIndex %o", slideIndex);
  var newSlidePos = this.getSlideOffsetFromZero(slideIndex);
  var storyAnimation = this.controller.getAnimatedElement("storyDetail");
  storyEl = storyAnimation.options.el;

  //set the slide visually
  $(storyEl).css("left", -newSlidePos+"px");

  //set the model property
  var model = this.controller.storyDetail;
  this.controller.storyDetail.set("storyIndex", slideIndex);
};

SlidePresenterExampleBDetail.prototype.getSlideOffsetFromZero = function(slideIndex){
  var slideOffsetFromZero = 0;
  var sliderOffset = this.getSliderOffset();
  this.$el.find(".slider-detail .story").each(function(idx) {
    if (idx+1 <= slideIndex) {
      slideOffsetFromZero += $(this).width();
    };
  });
  return slideOffsetFromZero;
};

SlidePresenterExampleBDetail.prototype.getSliderOffset = function(slideIndex){
  var sliderOffset = this.$el.find(".slider-fullsize.slider-detail").css("left");
  return -( sliderOffset.substring(0, sliderOffset.length-2) );
};

SlidePresenterExampleBDetail.prototype.getSlideMoveOffset = function(slideIndex){
  var sliderOffset = this.getSliderOffset();
  var slideOffsetFromZero = this.getSlideOffsetFromZero(slideIndex);
  var totalSlide = slideOffsetFromZero - sliderOffset;
  return totalSlide;
};

SlidePresenterExampleBDetail.prototype.goToSlide = function(slideIndex){
  //console.log("SlidePresenterExampleBDetail.goToSlide slideIndex %o", slideIndex);

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


SlidePresenterExampleBDetail.prototype.updateActiveStateItemNav = function(slideIndex){
  console.log("SlidePresenterExampleBDetail.updateActiveStateItemNav slideIndex %o", slideIndex);
  this.$el.find(".item-navigation .nav-item a").removeClass("active").eq(slideIndex).addClass("active");
};
