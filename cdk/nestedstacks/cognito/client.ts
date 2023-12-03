import { NestedStack } from "aws-cdk-lib";
import {
  CfnUserPoolClient,
  IUserPool,
  IUserPoolResourceServer,
  OAuthScope,
  ResourceServerScope,
  UserPool,
  UserPoolClient,
  UserPoolClientProps,
} from "aws-cdk-lib/aws-cognito";

import { Construct } from "constructs";

import { branch, domain, environment, fqdn, region } from "#helpers/configuration.ts";
import { isLocal } from "#helpers/environment.ts";
import handleOutputs from "#helpers/outputs.ts";
import { Ports } from "#helpers/ports.ts"

export default class ClientStack extends NestedStack {
  private application: string;

  private customScopes: ResourceServerScope[];

  private resourceServer: IUserPoolResourceServer;

  public readonly userPool: IUserPool;

  public readonly userPoolClient: UserPoolClient;

  constructor(
    scope: Construct,
    logicalID: string,
    userPoolClientProps: UserPoolClientProps,
    customScopes: string[] = [],
  ) {
    super(scope, logicalID, {});

    this.application = logicalID;
    this.userPool = userPoolClientProps.userPool;
    this.customScopes = customScopes.map((scope) => {
      return new ResourceServerScope({
        scopeDescription: scope,
        scopeName: scope,
      })
    });

    if (this.customScopes.length) {
      this.resourceServer = this.createResourceServer(customScopes);
    }

    this.userPoolClient = this.createClient(userPoolClientProps);
  }

  createResourceServer(customScopes: string[]) {
    const namespace = `${branch}-${this.application}-resource-server`;

    return this.userPool.addResourceServer(
      namespace,
      {
        identifier: namespace,
        scopes: this.customScopes,
      },
    );
  }

  createClient(userPoolClientProps: UserPoolClientProps) {
    const namespace = `${branch}-${this.application}-client`;
    const userPoolClientName = isLocal(environment) ? `_custom_id_:${namespace}` : namespace;
    const userPoolClient: UserPoolClient = this.userPool.addClient(
      namespace,
      {
        preventUserExistenceErrors: true,
        supportedIdentityProviders: userPoolClientProps.supportedIdentityProviders,
        userPoolClientName,
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
    cfnUserPoolClient.addPropertyOverride(
      "AllowedOAuthScopes",
      [
        "aws.cognito.signin.user.admin",
        "email",
        "openid",
        "profile",
        ...this.customScopes.map(scope => OAuthScope.resourceServer(this.resourceServer, scope).scopeName)
      ]
    );
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
