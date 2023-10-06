const grunt = require("grunt");

module.exports = (arguments, bypass = false) => {
  return arguments.map((arg) => {
    if (!grunt.option(arg) && !bypass) {
      return grunt.fail.fatal(`--${arg} is required`);
    }

    return grunt.option(arg);
  });
};
