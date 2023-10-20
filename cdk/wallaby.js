module.exports = function (w) {
  return {
    files: [
      "./helpers/*.ts",
      "./nestedstacks/*.ts",
      "./stacks/*.ts",
      "!./**/*.spec.ts",
    ],
    testFramework: {
        type: "jest",
        path: require('path').resolve(__dirname, './node_modules/jest'),
    },
    tests: [
      "./helpers/*.spec.ts",
      "./nestedstacks/*.spec.ts",
      "./stacks/*.spec.ts",
    ]
  };
};