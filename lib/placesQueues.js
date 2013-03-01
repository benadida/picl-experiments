/*
 * Set up all the places Queues
 */

const cq = require("./cqueue");

var BOOKMARKS_QUEUE = null;
function watchBookmarks() {
  BOOKMARKS_QUEUE = new cq.queue("bookmarks_outgoing");
  BOOKMARKS_QUEUE.setup(
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
      "delete": "values (OLD.guid, 'bookmark', 'delete', null, null, null, null, null, null)"
    });
}

function dumpBookmarksQueue() {
  BOOKMARKS_QUEUE.
    readAll().
    then(function(content) {
      var str = "\n\n";
      content.forEach(function(item) {
        str+= item + "\n";
      });
      console.log(str);
    });
};

exports.watchBookmarks = watchBookmarks;
exports.dumpBookmarksQueue = dumpBookmarksQueue;