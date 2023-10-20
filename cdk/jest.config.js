process.env.CDK_ENVIRONMENT = "local";

module.exports = {
  displayName: "CDK",
  roots: ["<rootDir>"],
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
