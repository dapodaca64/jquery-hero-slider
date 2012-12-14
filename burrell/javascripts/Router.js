var Workspace = Backbone.Router.extend({

  routes: {
    "hero":               "goToHero",
    "hero/:slide_index":  "goToHero",
    "story/:story_index": "goToStory"
  },

  goToHero: function(slideIndex) {
    //console.log("Backbone.Router.goToHero(%o)", slideIndex);
    app.pageNavigation.goToHero(slideIndex);
  },

  goToStory: function(storyIndex) {
    //console.log("Backbone.Router.goToStory(%o)", storyIndex);
    app.pageNavigation.goToStory(storyIndex);
  }

});
