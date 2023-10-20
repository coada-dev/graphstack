const { cwd } = require('node:process');

module.exports = (grunt) => {
  grunt.registerMultiTask(
    "cdk",
    "update app property in cdk.json with correct stack target",
    function () {
      const arguments = require(`${cwd()}/grunt/helpers/arguments`);
      const [ app ] = this.data.stack ? [this.data.stack] : arguments(["app"]);
      grunt.config.set("application", app);

      if (!grunt.file.exists(`${cwd()}/cdk/bin/${app}.ts`)) {
        grunt.fail.fatal(`cdk/bin/${app}.ts does not exist`);
      } else {
        const data = grunt.file.readJSON(`${cwd()}/cdk/${this.data.template}`);

        data.app = `npx ts-node --prefer-ts-exts bin/${app}.ts`;
        grunt.file.write(`${cwd()}/cdk/${this.data.output}`, JSON.stringify(data, null, 2));
        grunt.log.oklns(`template: ${cwd()}/cdk/${this.data.output}`);
      }
    }
  );
};