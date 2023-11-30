#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { config } from "dotenv";

import { account, branch, environment, region } from "#helpers/configuration.ts";
import { Environment } from "#helpers/environment.ts";
import DynamoDBDistributionStack from "#stacks/dynamo/schema/user.ts";
import PostgresDistributionStack from "#stacks/postgres/schema/user.ts";

if (environment === Environment.local) {
  config({ path: ".env.local" });
}

const app = new cdk.App();

new DynamoDBDistributionStack(app, `${branch}-schema-user-ddb`, {
  crossRegionReferences: true,
  env: { account, region },
});

new PostgresDistributionStack(app, `${branch}-schema-user-pg`, {
  crossRegionReferences: true,
  env: { account, region },
});