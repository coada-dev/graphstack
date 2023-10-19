#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { account, branch, region } from "#helpers/configuration.ts";
import DynamoDBDistributionStack from "#stacks/dynamo/schema/user.ts";

const app = new cdk.App();

new DynamoDBDistributionStack(app, `${branch}-schema-user`, {
  crossRegionReferences: true,
  env: { account, region },
});

