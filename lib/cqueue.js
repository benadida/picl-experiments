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

const { defer } = require('sdk/core/promise');

const env = require("./environment");
const db = env.getDB();

function CQueue(name) {
  if (!name)
    throw "queues need names";
  this.name = name;
}

// watch stuff
// triggers is keyed on "insert"/"update"/"delete"
// and the value for each is the values-portion
// of a sql insert statement
// e.g. {"insert": "values ('...')"}
//
// fields is keyed on field name and value is type of field
// e.g. {"title": "varchar(100)"}
CQueue.prototype.setup = function(watchedTableName, fields, triggers) {
  if (!watchedTableName)
    throw "queues need to watch a table";
  if (!fields)
    throw "queues need fields to watch";
  if (!triggers)
    throw "queues need triggers";

  this.watchedTableName = watchedTableName;

  // create the queue table if it doesn't already exist
  var queue_table_name = "cqueue_" + this.name;
  var field_clauses = [];
  Object.keys(fields).forEach(function(fieldName) {
    field_clauses.push(fieldName + " " + fields[fieldName]);
  });
  var field_clause_str = field_clauses.join(", ");

  var fields_only_clause_str = Object.keys(fields).join(", ");

  db.createStatement("drop table if exists " + queue_table_name).execute();

  var sql = "create table " + queue_table_name + " (id integer not null primary key autoincrement, uuid varchar(20), collection varchar(100), action varchar(20), " + field_clause_str + ")";
  db.createStatement(sql).execute();

  var trigger_suffix = queue_table_name + "_" + watchedTableName;

  Object.keys(triggers).forEach(function(triggerAction) {
    // create the trigger
    var sql = "create trigger if not exists " + triggerAction + "_" + trigger_suffix + " before " + triggerAction + " on " + watchedTableName + " for each row begin insert into " + queue_table_name + "(uuid, collection, action, " + fields_only_clause_str +") " + triggers[triggerAction] + "; end;";
    db.createStatement(sql).execute();
  });
};

// read out a qhole queue
CQueue.prototype.readAll = function() {
  var deferred = defer();

  // FIXME: DRY on queue table name
  var queue_table_name = "cqueue_" + this.name;

  var sql = "select * from " + queue_table_name;

  var results = [];
  db.createStatement(sql).executeAsync({
    handleResult: function(aResultSet) {
      for (let row = aResultSet.getNextRow();
           row;
           row = aResultSet.getNextRow()) {
        var one_result = [];
        for (var i=0; i<row.numEntries; i++) {
          one_result.push(row.getResultByIndex(i));
        }
        results.push(one_result);
      }
    },

    handleError: function(aError) {
      deferred.reject(aError);
    },

    handleCompletion: function(aReason) {
      if (aReason != env.DB_REASON_FINISHED)
        deferred.reject(aReason);
      else
        deferred.resolve(results);
    }
  });

  return deferred.promise;
};

// a function to get the first N items in the queue to work on,
// locking the database during this time with an "immediate" or
// maybe even "exclusive" transaction

exports.queue = CQueue;