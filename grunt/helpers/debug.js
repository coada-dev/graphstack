const grunt = require("grunt");

module.exports = (command) => {
  const debug = grunt.option("debug") || false;
  const environment = grunt.config.get("environment");
  let cmd = command;

  if (debug || ["development", "test"].includes(environment)) {
    cmd = `CDK_DEBUG=true ${command} --no-rollback --debug --verbose`;
  }

  return cmd;
};
