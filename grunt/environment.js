module.exports = (grunt) => {
  grunt.registerTask("environment", () => {
    const environment = grunt.option("environment") || "local";
    const environments = [
      "local",
      "development",
      "test",
      "staging",
      "production",
    ];

    if (environments.includes(environment)) {
      grunt.config.set("environment", environment);
      grunt.log.oklns(`Environment: ${environment}`);
    } else {
      grunt.fail.fatal("Grunt: environment unknown");
    }
  });
};
