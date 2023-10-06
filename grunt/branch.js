const { execSync } = require("child_process");

module.exports = (grunt) => {
  grunt.registerTask("branch", () => {
    let branch =
      grunt.option("branch") ||
      execSync("git rev-parse --abbrev-ref HEAD")
        .toString("utf8")
        .replace(/[\n\r\s]+$/, "");
    branch = branch.toLowerCase();
    grunt.log.oklns(`Branch: ${branch}`);
    grunt.config.set("branch", branch);
  });
};
