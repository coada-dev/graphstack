const { cwd } = require('node:process');

const debug = require("./helpers/debug");
const arguments = require("./helpers/arguments");
const cdk = require("./helpers/cdk");

const factory = (grunt, stackname) => {
  const { profile, bin, environment, local } = cdk();
  const application = grunt.config.get("application");
  const branch = grunt.config.get("branch");
  const zscaler = grunt.option("zscaler");

  let vars = `CDK_ENVIRONMENT=${environment}`;

  if (!local) {
    const [account, region] = arguments(["account", "region"]);
    vars = `${vars} CDK_ACCOUNT=${account} CDK_REGION=${region}`;
  } else if (zscaler) {
    grunt.log.oklns("ZSCALER configuration found");
    vars = `${vars} CDK_ZSCALER=true`;
  }

  const stack = application === "account" ? stackname : `${branch}-${stackname}`;
  vars = `${vars} CDK_BRANCH=${branch}`;
  return { bin, branch, environment, profile, stack, vars };
};

const options = {
  execOptions: {
    cwd: `${cwd()}/cdk`,
  }
}

module.exports = (grunt) => ({
  cleanupCertificateRecords: {
    command: (ci = false) => {
      const [ stackname ] = arguments(["stackname"]);
      let { profile, vars } = factory(grunt, stackname);

      if (!ci) {
        vars = `AWS_PROFILE=${profile} ${vars}`;
      }

      return `${vars} CDK_STACK=${stackname} ts-node ./grunt/sdk/tasks/deleteCertificationValidationRecord.ts`;
    },
  },
  "aws-session-check": {
    command: () => {
      const { profile } = factory(grunt);
      return `aws sts get-caller-identity --profile ${profile}`;
    },
    options: {
      callback: (err, stdout, stderr, callback) => {
        if (stderr) {
          grunt.log.error(stderr);
          return callback();
        }

        const { Account: account } = JSON.parse(stdout);
        grunt.config.set("awsAccountNumber", account);
        return callback();
      },
      stdout: false,
    }
  },
  "aws-session-login": {
    command: () => {
      const awsAccountNumber = grunt.config.get("awsAccountNumber");

      if (awsAccountNumber) {
        return `echo authenticated:${awsAccountNumber}`;
      } else {
        const { profile } = factory(grunt);
        return `aws sso login --profile ${profile}`;
      }
    }
  },
  "cdk-bootstrap": {
    options,
    command: () => {
      const { bin, profile, vars } = factory(grunt);

      return debug(`AWS_PROFILE=${profile} ${vars} npx ${bin} bootstrap`);
    },
  },
  "cdk-deploy": {
    options,
    command: (ci = false) => {
      const [ stackname ] = arguments(["stackname"]);
      let { bin, environment, profile, stack, vars } = factory(grunt, stackname);

      if (!ci) {
        vars = `AWS_PROFILE=${profile} ${vars}`;
      }

      let command = `${vars} npx ${bin} deploy --require-approval never ${stack}`;

      if (environment === "local") {
        command = `--outputs-file output/${stack}.json ${command}`;
      }

      grunt.log.oklns(`Deploying: ${stackname}`);
      return debug(command);
    },
  },
  "cdk-destroy": {
    options,
    command: (ci = false) => {
      const [ stackname ] = arguments(["stackname"]);
      let { bin, profile, stack, vars } = factory(grunt, stackname);

      if (!ci) {
        vars = `AWS_PROFILE=${profile} ${vars}`;
      }

      return debug(`yes | ${vars} npx ${bin} destroy ${stack}`);
    },
  },
  "cdk-diff": {
    options,
    command: () => {
      const [ stackname ] = arguments(["stackname"]);
      const { bin, environment, profile, stack, vars } = factory(grunt, stackname);
      let command = `AWS_PROFILE=${profile} ${vars} npx ${bin} diff --require-approval never ${stack}`;

      if (environment === "local") {
        command = `${command}`;
      }

      grunt.log.oklns(`Diff: ${stackname}`);
      return debug(command);
    },
  },
  "cdk-synth": {
    options,
    command: () => {
      const [ stackname ] = arguments(["stackname"]);
      const { bin, profile, stack, vars } = factory(grunt, stackname);
      return debug(`AWS_PROFILE=${profile} ${vars} npx ${bin} synth ${stack}`);
    },
  },
  getSSMRecord: {
    command: (ci = false) => {
      const { profile } = factory(grunt);
      const [ path, region ] = arguments(["path", "region"]);
      let vars = `CDK_REGION=${region} SSM_PATH=${path}`;

      if (!ci) {
        vars = `AWS_PROFILE=${profile} ${vars}`;
      }

      return `${vars} ts-node ./grunt/sdk/tasks/getSSMRecord.ts`;
    },
    options: {
      callback: (err, stdout, stderr, callback) => {
        if (err) {
          grunt.log.error(err);
          return callback(false);
        }

        const [key, value] = stdout.trim().split(",");
        const outputPath = "output/records.json";
        let body = {
          [+new Date()]: {
            [key]: value,
          },
        };

        if (grunt.file.exists(outputPath)) {
          let json = grunt.file.readJSON(outputPath);
          body = { ...json, ...body };
        }

        grunt.file.write(outputPath, JSON.stringify(body, null, 2));
        return callback();
      },
    },
  },
});
