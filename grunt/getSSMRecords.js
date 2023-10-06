const arguments = require("./helpers/arguments");

module.exports = (grunt) => {
  const records = (paths) => {
    const branch = grunt.config.get("branch");
    const [environment, region] = arguments(["environment", "region"]);

    paths.forEach((path, i) => {
      const stack = `${environment}-${branch}-${path.stackname}`;

      grunt.task.run(
        `shell:getSSMRecord:/${path.service}/${stack}-${path.variable}`,
      );
    });
  };

  grunt.registerMultiTask(
    "ssm",
    "get ssm records from cloudformation outputs with mutli-region support",
    function () {
      try {
        records(this.data);
      } catch (error) {
        grunt.fail.fatal(error);
      }
    },
  );
};
