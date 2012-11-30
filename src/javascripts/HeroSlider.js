$ = jQuery;

var AnimatedElement = function(options){
  var defaults = {
    el: false,
    animateProperties: {
      left: "+=200",
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
    console.log("AnimatedElement.startAnimation...");
    //internal check
    this.isPlaying = true;

    //external interface
    $(this.el).animate(this.options.animateProperties, {
        duration: this.options.animateDuration,
        easing: this.options.animateEasing,
        callback: this.options.animateCallback
      }
    );
  };
  this.stopAnimation = function(){
    //internal check
    this.isPlaying = false;

    //external interface
    $(this.el).stop();
  };
  this.deQueueAnimation = function(){
    //external interface
    $(this.el).dequeue(this.options.animateProperties.queueName);
  };
  this.getAnimationQueue = function(){
    return $(this.el).queue(this.options.animateProperties.queueName);
  };
};

var HeroSlider = function(options){
  var defaults = {
    el: false,
    autoRotate: true,
    circular: true //continuous loop through the stories
  };
  this.options = $.extend({}, defaults, options);
};

HeroSlider.prototype.init = function(){
  // Our DOM scope
  this.el = this.options.el;

  // initial behaviors
  // let's be very deliberate about this configuration
  this.autoRotate = this.options.autoRotate;
  this.circular = this.options.circular;

  // TODO: Handling this scope might not be necessary
  //       Might be possible to do everything in test setup/teardown
  // when DOM
  if (this.options.el) {
    //console.log("HeroSlider with DOM el %o", this.options.el);
  // testing
  } else {
  }

  // initial states
  this.storyCount = 5;
  this.storyIndex = 0;
  this.layoutMode = "default"; // "default" or "detail"
  this.animatedEls = [ ];
  this.stories = [ ];

};

HeroSlider.prototype.run = function(){
  if (this.autoRotate) {
    this.startAnimation();
  };
};

HeroSlider.prototype.getStoryCount = function(){
  return (this.stories.length) ? this.stories.length : this.storyCount;
};

HeroSlider.prototype.nextStory = function(){
  //console.log("HeroSlider.nextStory: storyIndex %o storyCount %o", this.storyIndex, this.getStoryCount());
  if (this.storyIndex + 1 == this.getStoryCount()) {
    this.storyIndex = 0;
  } else {
    this.storyIndex += 1;
  }
  //TODO: do render tasks
};

HeroSlider.prototype.previousStory = function(){
  //console.log("HeroSlider.previousStory: storyIndex %o storyCount %o", this.storyIndex, this.getStoryCount());
  if (this.storyIndex == 0) {
    this.storyIndex = this.getStoryCount()-1;
  } else {
    this.storyIndex -= 1;
  }
  //TODO: do render tasks
};

HeroSlider.prototype.layoutModeToggle = function(){
  this.layoutMode = (this.layoutMode === "default") ? "detail" : "default";
  //TODO: do layout tasks
};

HeroSlider.prototype.isPlaying = function(){
  for (var i=0, j=this.animatedEls.length; i<j; i++) {
    if (this.animatedEls[i].isPlaying) {
      return true;
    }
  }
  return false;
};

HeroSlider.prototype.newAnimatedElement = function(options) {
  var ae = new AnimatedElement(options);
  this.animatedEls.push(ae);
  return ae;
};

HeroSlider.prototype.stopAnimation = function(){
  console.log("HeroSlider.stopAnimation...");
  //this.deQueueAnimation();
  //TODO: do animation tasks
  for (var i=0, j=this.animatedEls.length; i<j; i++) {
    this.animatedEls[i].stopAnimation();
  }
};

HeroSlider.prototype.startAnimation = function(){
  console.log("HeroSlider.startAnimation...");
  this.deQueueAnimation();
  for (var i=0, j=this.animatedEls.length; i<j; i++) {
    this.animatedEls[i].startAnimation();
  }
};

HeroSlider.prototype.deQueueAnimation = function(){
  console.log("HeroSlider.deQueueAnimation...");
  for (var i=0, j=this.animatedEls.length; i<j; i++) {
    this.animatedEls[i].deQueueAnimation();
  }
};

HeroSlider.prototype.getAnimationQueues = function(){
  console.log("HeroSlider.getAnimationQueues...");
  var queues = [ ];
  for (var i=0, j=this.animatedEls.length; i<j; i++) {
    queues.push(this.animatedEls[i].getAnimationQueue());
  }
  return queues;
};
