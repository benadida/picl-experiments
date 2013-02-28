var cq = require("./cqueue");

exports["test cqueue"] = function(assert) {
  assert.ok(cq.queue, "there is no cqueue");
  assert.ok(new cq.queue("outgoing"), "one cannot create a cqueue");
};

exports["test cqueue bad creation"] = function(assert) {
  assert.throws(function() {
    new cq.queue();
  });
};

exports["test cqueue creation of on-db stuff"] = function(assert) {
  var q = new cq.queue("outgoing");
  q.watchTable("moz_bookmarks", {
    "insert": "values ('fill-in UIUD here', 'bookmark', 'create', NEW.title)",
    "update": "values ('fill-in UIUD here', 'bookmark', 'update', NEW.title)",
    "delete": "values ('fill-in UIUD here', 'bookmark', 'delete', null)"
  });
  assert.pass("created the queue");
};

require("test").run(exports);
