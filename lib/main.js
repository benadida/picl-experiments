
let env = require("./environment");
env.init();

let data = require("sdk/self").data;

let placesQueues = require("./placesQueues");
placesQueues.watchBookmarks();

// a quick UI to show what we're watching
require("sdk/widget").Widget({
  id: "mozilla-icon",
  label: "picl",
  contentURL: data.url("pickle.ico"),
  onClick: function() {
    placesQueues.dumpBookmarksQueue();
  }
});

console.log("ready to go!");