module.exports = (grunt) => {
  grunt.registerTask("dotenv", () => {
    const environment = grunt.config.get("environment");
    const path = `.env.${environment}`;

    try {
        require("dotenv").config({ path });
    } catch (error) {
        console.warn(error);
    }
  });
};
