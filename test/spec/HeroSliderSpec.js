describe("Hero Slider", function(){
  var hero, idOffset = 0;

  beforeEach(function(){

    var el = document.createElement("div");
    // Ensure unique DOM ids
    var elId = "hero_slider_"+idOffset;
    idOffset += 1;

    el.setAttribute("id", elId);
    el.setAttribute("class", "hero-slider");
    document.body.appendChild(el);

    $el = $("#"+elId);
    $el.css({
      "width": "100px",
      "height": "100px",
      "position": "absolute",
      "top": "200px",
      "left": "800px",
      "background-color": "green",
      "display": "none",
      "font-family": "Arial",
      "font-size": "12px",
      "line-height": "14px",
      "color": "#ffffff",
      "padding": "8px"
    });

    hero = new HeroSlider({
      el: $el
    });

    hero.init();

    hero.newAnimatedElement("test", {
      el: hero.el,
      animateProperties: {
        left: "+=200"
      },
      animateDuration: 3000+topOffset*10,
      animateCallback: function() {
        //removeAnimatedObject();
      }
    });


  });

  afterEach(function(){
    //this removes the DOM object before animations are complete. So
    //we manage this in the animation callback below
    //$("#hero_slider").remove();
  });

  var topOffset = 0;
  var incrementTopPosition = function($el) {
    topOffset += 120;
    $el.css({ "top": topOffset });
    return $el;
  }
  var markDebugEl = function($el, message) {
    $el.html(message);
    incrementTopPosition($el);
    $el.show()
  };
  var removeAnimatedObject = function(){
    $("#hero_slider").remove();
  };

  describe("when running with default configuration", function(){

    it("should allow switching between layout modes 'default' and 'detail'", function(){
      //default is "default"

      //switch to "detail"
      hero.layoutModeToggle();
      var a = hero.story.get("layoutMode");
      expect(a).toBe("detail");

      //switch back to "default"
      hero.layoutModeToggle();
      var b = hero.story.get("layoutMode");
      expect(b).toBe("default");
    });

  });

  describe("when configured to autorotate", function(){

    it("should be animating on landing", function(){
      console.log(arguments);
      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "animate if autorotate");

      //set configuration
      hero.autoRotate = true;

      //initiate the landing state
      hero.run();

      var a = hero.isPlaying();
      expect(a).toBe(true);
    });

  });

  describe("when configured not to autorotate", function(){

    it("should be static (not animating) upon landing", function(){
      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "no animate if not autorotate");

      //set configuration
      hero.autoRotate = false;

      //initiate the landing state
      hero.run();

      var a = hero.isPlaying();
      expect(a).toBe(false);
    });

  });

  describe("when navigating", function(){

    it("should always be able to go to a next story", function(){
      //3 stories,
      hero.story.set("storyCount", 3);

      //starting at story 1 (zero-indexed):
      hero.story.set("storyIndex", 0);

      //A: go to story 2
      hero.nextStory();
      var a = hero.story.get("storyIndex") + 1;
      expect(a).toBe(2);

      //B: go to story 3
      hero.nextStory();
      var b = hero.story.get("storyIndex") + 1;
      expect(b).toBe(3);

      //C: wrap around to story 1
      hero.nextStory();
      var c = hero.story.get("storyIndex") + 1;
      expect(c).toBe(1);
    });

    it("should always be able to go to a previous story", function(){
      //3 stories,
      hero.story.set("storyCount", 3);

      //starting at story 1 (zero-indexed):
      hero.story.set("storyIndex", 0);

      //A. wrap around to story 3
      hero.previousStory()
      var a = hero.story.get("storyIndex") + 1;
      var ab = hero.story.get("storyCount");
      expect(a).toBe(ab);

      //B. go to story 2
      hero.previousStory()
      var b = hero.story.get("storyIndex") + 1;
      expect(b).toBe(2);

      //C. go to story 1
      hero.previousStory()
      var c = hero.story.get("storyIndex") + 1;
      expect(c).toBe(1);
    });

  });

  describe("when animations are stopped", function(){

    it("should indicate that animations are stopped", function(){
      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "should indicate that animations are stopped");
      incrementTopPosition($el);
      $el.show()

      hero.stopAnimations();
      var a = hero.isPlaying();
      expect(a).toBe(false);
    });

    it("should allow for animations to be started", function(){
      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "should allow for animations to be started");

      hero.startAnimations();
      var a = hero.isPlaying();
      expect(a).toBe(true);
    });

    it("should be possible restart animations", function(){
      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "should be possible to restart animations");

      hero.stopAnimations();
      hero.startAnimations();
      var a = hero.isPlaying();
      expect(a).toBe(true);
    });

  });

  describe("when animations are running", function(){

    it("should indicate that animations are running", function(){
      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "should indicate that animations are running");

      incrementTopPosition($el);
      $el.show()

      hero.startAnimations();
      var a = hero.isPlaying();
      expect(a).toBe(true);
    });

    it("should allow for animations to be stopped", function(){
      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "should allow for animations to be stopped");

      incrementTopPosition($el);
      $el.show()

      hero.startAnimations();
      hero.stopAnimations();
      var a = hero.isPlaying();
      expect(a).toBe(false);
    });

    it("should be possible restart animations", function(){
      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "should be possible to restart animations");

      hero.startAnimations();
      hero.stopAnimations();
      hero.startAnimations();
      var a = hero.isPlaying();
      expect(a).toBe(true);
    });

  });

  describe("when stacking animations", function(){

    it("should run only the current animation", function(){
      // Alternately:
      // "should dequeue all animation when starting a new animation"

      //animation test will show the related DOM element created in the setup beforeEach
      markDebugEl($el, "should run only the current animation");

      // Start asynchronous animations one after another
      hero.startAnimations();
      hero.startAnimations();

      // The second animation call would normally stack
      // animations into the queue but it should
      // dequeue animations with every start.
      // let's get the collection of animation queues and
      // check that each queue has one animation in it
      var anims = hero.getAnimationQueues();
      console.log("anims %o", anims);
      for (var i=0, j=anims.length; i<j; i++) {
        var a = anims[i].length;
        expect(a).toBe(1);
      }
    });

  });

  xdescribe("when in detail layout mode", function(){

  });

});
