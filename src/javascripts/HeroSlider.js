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

BasicModel.prototype.subscriptions = {
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

HeroSlider.prototype.goToStory = function(storyIndex){
  console.log("HeroSlider.goToStory: %o", storyIndex);
  this.story.set("storyIndex", +(storyIndex));
};

HeroSlider.prototype.nextStory = function(){
  console.log("HeroSlider.nextStory: storyIndex %o storyCount %o", this.story.get("storyIndex"), this.story.get("storyCount"));
  var storyIndex = this.story.get("storyIndex");
  if (storyIndex + 1 == this.story.get("storyCount")) {
    this.story.set("storyIndex", 0);
  } else {
    this.story.set("storyIndex", storyIndex + 1);
  }
};

HeroSlider.prototype.previousStory = function(){
  //console.log("HeroSlider.previousStory: storyIndex %o storyCount %o", this.story.get("storyIndex"), this.story.get("storyCount"));
  var storyIndex = this.story.get("storyIndex");
  if (storyIndex == 0) {
    //update the model
    this.story.set("storyIndex", this.story.get("storyCount") - 1);
  } else {
    //update the model
    this.story.set("storyIndex", storyIndex - 1);
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
  console.log("ev.currentTarget %o, ev.target %o", ev.currentTarget, ev.target);
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
  //console.log("HeroSlider init runs with this %o", this);
  //TODO: A Model. Is there better to place for this?
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
  //this.parent = SlidePresenter.prototype;
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
  console.log("inspecting %o", $(ev.target).parent() );
  var storyIndex = $(ev.target).parent().attr("data-storyindex");
  console.log("Let's go storyIndex %o", storyIndex);
  this.controller.goToStory(storyIndex);
};

SlidePresenterExampleA.prototype.nextStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.nextStory();
};

SlidePresenterExampleA.prototype.previousStoryClickHandler = function(ev){
  ev.preventDefault();
  this.controller.previousStory();
};


// Data event handlers
SlidePresenterExampleA.prototype.storyIndexChangeHandler = function(story) {
  console.log("SlidePresenter.storyIndexChangeHandler for model %o", story);
  this.goToSlide(story.get("storyIndex"));
};

SlidePresenterExampleA.prototype.storyLayoutChangeHandler = function(story) {
  console.log("SlidePresenter.storyLayoutChangeHandler for model %o", story);
  this.switchLayoutMode(story.get("layoutMode"));
};

SlidePresenterExampleA.prototype.bindDataEvents = function(){
  //Subscribe to the change event on the model via the controller
  this.controller.story.on("change:storyIndex", this.storyIndexChangeHandler.bind(this));
  this.controller.story.on("change:layoutMode", this.storyLayoutChangeHandler.bind(this));
};

SlidePresenterExampleA.prototype.goToSlide = function(slideIndex){
  console.log("SlidePresenter.goToSlide slideIndex %o", slideIndex);
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
  var detailAnimation = this.controller.getAnimatedElement("detailPanes");
  var detailNavItemAnimation = this.controller.getAnimatedElement("detailItemNav");
  var detailNavAnimation = this.controller.getAnimatedElement("detailNav");
  var detailCloseAnimation = this.controller.getAnimatedElement("detailClose");
  var teaserAnimation = this.controller.getAnimatedElement("teaserPanes");
  var teaserNavAnimation = this.controller.getAnimatedElement("teaserNav");

  var self = this;

  if (mode === "default") {
    console.log("SlidePresenter.switchLayoutMode to default.");

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
    console.log("SlidePresenter.switchLayoutMode to detail.");

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

