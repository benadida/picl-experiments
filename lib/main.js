
let env = require("./environment");

env.init();

var db = env.getDB();

let statement = db.createStatement("select count(*) from moz_bookmarks");

statement.executeAsync({
  handleResult: function(aResultSet) {
    for (let row = aResultSet.getNextRow();
         row;
         row = aResultSet.getNextRow()) {

      console.log(row.getResultByIndex(0));
    }
  },
  handleCompletion: function(aReason) {
  }
});
