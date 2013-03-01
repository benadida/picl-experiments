var placesQueues = require("./placesQueues");

exports["test placesQueues"] = function(assert) {
  assert.ok(placesQueues, "there is no placesQueues");
  assert.ok(placesQueues.watchBookmarks, "there is no bookmarks watch");
};

exports["test placesQueues watchBookmarks"] = function(assert) {
  placesQueues.watchBookmarks();
  assert.pass("set up watchBookmarks");
};

require("test").run(exports);
