var env = require("./environment");

exports["test environment"] = function(assert) {
  assert.notEqual(env.init, undefined, "there is no init function");
  assert.notEqual(env.getDB, undefined,  "there is no getDB function");
};

exports["test environment init"] = function(assert) {
  env.init();
  env.init();
  // shouldn't throw
  assert.pass("env can be inited twice");
};

exports["test getDB returns a db connection"] = function(assert) {
  env.init();
  assert.ok(env.getDB());
  assert.ok(env.getDB().createStatement);
};

require("test").run(exports);
