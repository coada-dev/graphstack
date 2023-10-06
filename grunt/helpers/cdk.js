const grunt = require("grunt");
const package = require("../../package.json");

module.exports = () => {
  const environment = grunt.config.get("environment");
  const local = environment === "local";
  const profile = grunt.config.get("profile");

  return {
    bin: local ? "cdklocal" : "cdk",
    environment,
    local,
    profile: profile || `${package.name}-${environment}`,
  };
};
