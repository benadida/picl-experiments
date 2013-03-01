var cq = require("./cqueue");

exports["test cqueue"] = function(assert) {
  assert.ok(cq.queue, "there is no cqueue");
  assert.ok(new cq.queue("outgoing"), "one cannot create a cqueue");
};

exports["test cqueue bad setup"] = function(assert) {
  var q = new cq.queue("outgoing");
  assert.throws(function() {
    q.setup();
  });
  assert.throws(function() {
    q.setup("moz_bookmarks");
  });
  assert.throws(function() {
    q.setup("moz_bookmarks", {"foo": "integer"});
  });

};

exports["test cqueue creation of on-db stuff"] = function(assert) {
  var q = new cq.queue("outgoing");
  q.setup(
    "moz_bookmarks",
    {
      type: "integer",
      parent: "integer",
      position: "integer",
      title: "longvarchar",
      dateAdded: "integer",
      lastModified: "integer"
    },
    {
      "insert": "values (NEW.guid, 'bookmark', 'create', NEW.type, NEW.parent, NEW.position, NEW.title, NEW.dateAdded, NEW.lastModified)",
      "update": "values (NEW.guid, 'bookmark', 'update', NEW.type, NEW.parent, NEW.position, NEW.title, NEW.dateAdded, NEW.lastModified)",
      "delete": "values (NEW.guid, 'bookmark', 'delete', null, null, null, null, null, null)"
    });
  assert.pass("created the queue");
};

require("test").run(exports);
