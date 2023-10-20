#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { account, branch, region } from "#helpers/configuration.ts";
import APIGWSecurityStack from "#stacks/vpc/security/groups/apigw.ts";

const app = new cdk.App();

// NOTE: Security stack meant for existing VPC stacks
// can be attached directly to ephemeral resources
// e.g. API Gateway by way of resource lookup
new APIGWSecurityStack(app, `${branch}-security`, {
  env: { account, region },
});

