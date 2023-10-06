#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { account, branch, region } from "#helpers/configuration.ts";
import EnvironmentStack from "../stacks/region/environment";

const app = new cdk.App();

// NOTE: Environment stack for non-ephemeral, shared, resources e.g. DNS, VPC, etc.
new EnvironmentStack(app, `${branch}-environment`, {
  env: { account, region },
});

