#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { account } from "#helpers/configuration.ts";
import GithubOIDCStack from "#nestedstacks/iam/oidc.ts";

const app = new cdk.App();

// NOTE: Github OIDC OAuth2 connection for runner authentication to AWS account
new GithubOIDCStack(app, "oidc", {
  crossRegionReferences: true,
  env: { account, region: "us-east-1" },
});

