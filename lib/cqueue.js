/*
 * a CRUD queue in the database
 *
 * a CRUD queue is an ordered list of create/update/delete actions
 * meant to be performed on a set of resources. Each resource must
 * have a GUID, and a resource can have a type. The GUID must be global
 * independent of the type, the type is there only to guide later action
 * by consumers of the queue.
 *
 * a CRUD queue has transactional properties that are wrapped
 * nicely by this abstraction.
 */

const env = require("./environment");
const db = env.getDB();

function CQueue() {
}

// watch stuff
// triggers is keyed on "insert"/"update"/"delete"
// and the value for each is the values-portion
// of a sql insert statement
// e.g. {"insert": "values ('...')"}
//
// fields is keyed on field name and value is type of field
// e.g. {"title": "varchar(100)"}
CQueue.prototype.setup = function(name, watchedTableName, fields, triggers) {
  if (!name)
    throw "queues need names";
  if (!watchedTableName)
    throw "queues need to watch a table";
  if (!fields)
    throw "queues need fields to watch";
  if (!triggers)
    throw "queues need triggers";

  this.name = name;
  this.watchedTableName = watchedTableName;

  // create the queue table if it doesn't already exist
  var queue_table_name = "cqueue_" + this.name;
  var field_clauses = [];
  Object.keys(fields).forEach(function(fieldName) {
    field_clauses.push(fieldName + " " + fields[fieldName]);
  });
  var field_clause_str = field_clauses.join(", ");

  var fields_only_clause_str = Object.keys(fields).join(", ");

  db.createStatement("create table if not exists " + queue_table_name + " (id integer not null primary key autoincrement, uuid varchar(20), type varchar(100), action varchar(20), " + field_clause_str + ")").execute();

  var trigger_suffix = queue_table_name + "_" + watchedTableName;

  Object.keys(triggers).forEach(function(triggerAction) {
    // create the trigger
    var sql = "create trigger if not exists " + triggerAction + "_" + trigger_suffix + " before " + triggerAction + " on " + watchedTableName + " for each row begin insert into " + queue_table_name + "(uuid, type, action, " + fields_only_clause_str +") " + triggers[triggerAction] + "; end;";
    db.createStatement(sql).execute();
  });
};

// a function to get the first N items in the queue to work on,
// locking the database during this time with an "immediate" or
// maybe even "exclusive" transaction

exports.queue = CQueue;