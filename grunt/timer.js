module.exports = (grunt) => {
  grunt.registerTask("timer", () => {
    const ts = +new Date();
    const start = grunt.config.get("starttime");
    const action = start ? "ended" : "started";

    grunt.log.oklns(`Time ${action}: ${new Date(ts).toLocaleString()}`);

    if (start) {
        const elapsed = Math.ceil((ts - start) / 1000);
        grunt.log.oklns(`Deployment time: ${elapsed} seconds`);
    } else {
        grunt.config.set("starttime", ts);
    }
  });
};
