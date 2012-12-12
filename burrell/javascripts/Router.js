var Workspace = Backbone.Router.extend({

  routes: {
    "hero":                 "goToHero",
    "hero/:story_index":    "goToHero",
    "story/:module_index":  "goToModule"
  },

  goToHero: function(storyIndex) {
      console.log("Backbone.Router.goToHero(%o)", storyIndex);
  },

  goToStory: function(moduleIndex) {
    console.log("Backbone.Router.goToStory(%o)", moduleIndex);
  }

});
