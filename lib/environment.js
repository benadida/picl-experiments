
/*
 * setup the environment, db connection, etc.
 */

const {Cc, Ci, Cu} = require("chrome");

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");

var db = null;
function getDB() {
  return db;
}

function init() {
  // the database
  let file = FileUtils.getFile("ProfD", ["places.sqlite"]);
  db = Services.storage.openDatabase(file);
}

exports.init = init;
exports.getDB = getDB;
exports.DB_REASON_FINISHED = Ci.mozIStorageStatementCallback.REASON_FINISHED;