module.exports = {
  cdk: {
    src: [
      "cdk/cdk.context.json",
      "cdk/cdk.json",
      "cdk/cdk.out",
    ],
  },
  local: {
    src: [
      "cdk/output/.env.*",
      "cdk/output/*.json",
      "!cdk/output/<%= grunt.config.get('environment') %>-<%= grunt.config.get('branch') %>-*.json",
    ],
  },
};
