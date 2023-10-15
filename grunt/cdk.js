module.exports = {
  bin: {
    output: "cdk.json",
    template: "cdk.template.json",
  },
  environment: {
    output: "cdk.json",
    stack: "environment",
    template: "cdk.template.json",
  },
  security: {
    output: "cdk.json",
    stack: "security",
    template: "cdk.template.json",
  }
};