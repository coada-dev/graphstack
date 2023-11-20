const grunt = require("grunt");
const package = require("../../package.json");

module.exports = () => {
  const environment = grunt.config.get("environment");
  const local = environment === "local";
  const profile = grunt.option("profile");

  return {
    bin: local ? "cdklocal" : "cdk",
    ci: grunt.option("ci"),
    environment,
    local,
    profile: profile || `${package.name}-${environment}`,
  };
};
