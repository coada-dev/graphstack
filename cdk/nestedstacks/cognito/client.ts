import { NestedStack } from "aws-cdk-lib";
import {
  CfnUserPoolClient,
  UserPool,
  UserPoolClient,
  UserPoolClientProps,
} from "aws-cdk-lib/aws-cognito";

import { Construct } from "constructs";

import { branch, domain, environment, fqdn, region } from "#helpers/configuration.ts";
import handleOutputs from "#helpers/outputs.ts";
import { Ports } from "#helpers/ports.ts"

export default class ClientStack extends NestedStack {
  private application: string;

  public readonly userPool: UserPool;

  public readonly userPoolClient: UserPoolClient;

  constructor(
    scope: Construct,
    logicalID: string,
    userPoolClientProps: UserPoolClientProps,
  ) {
    super(scope, logicalID, {});

    this.application = logicalID;
    this.userPoolClient = this.createClient(userPoolClientProps);
  }

  createClient(userPoolClientProps: UserPoolClientProps) {
    const namespace = `${branch}-${this.application}-client`;

    const userPoolClient: UserPoolClient = userPoolClientProps.userPool.addClient(
      namespace,
      {
        preventUserExistenceErrors: true,
        supportedIdentityProviders: userPoolClientProps.supportedIdentityProviders,
        userPoolClientName: namespace,
      },
    );

    const cfnUserPoolClient = userPoolClient.node
      .defaultChild as CfnUserPoolClient;
    cfnUserPoolClient.addPropertyOverride("ExplicitAuthFlows", [
      "ALLOW_CUSTOM_AUTH",
      "ALLOW_REFRESH_TOKEN_AUTH",
      "ALLOW_USER_SRP_AUTH",
    ]);
    cfnUserPoolClient.addPropertyOverride("AllowedOAuthFlows", ["code"]);
    cfnUserPoolClient.addPropertyOverride(
      "AllowedOAuthFlowsUserPoolClient",
      true,
    );
    cfnUserPoolClient.addPropertyOverride("AllowedOAuthScopes", [
      "aws.cognito.signin.user.admin",
      "email",
      "openid",
      "profile",
    ]);
    cfnUserPoolClient.addPropertyOverride("CallbackURLs", [
      `https://${branch}.${this.application}.${fqdn}/idp/callback`,
      `https://${branch}.${this.application}.${environment}.${domain}.localhost:${Ports.vite}/idp/callback`,
    ]);
    cfnUserPoolClient.addPropertyOverride("LogoutURLs", [
      `https://${branch}.${this.application}.${fqdn}/logout`,
      `https://${branch}.${this.application}.${environment}.${domain}.localhost:${Ports.vite}/logout`,
    ]);

    handleOutputs(
      this,
      {
        label: `${branch}-${this.application}-userPoolClientId`,
        region,
        service: "cognito",
      },
      userPoolClient.userPoolClientId,
    );

    return userPoolClient;
  }
}
