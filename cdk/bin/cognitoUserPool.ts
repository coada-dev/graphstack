#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { account, branch, region } from "#helpers/configuration.ts";
import CognitoUserPoolStack from "#stacks/cognito/userPool.ts";

const app = new cdk.App();

new CognitoUserPoolStack(app, `${branch}-cognito-pool`, {
  env: { account, region },
});