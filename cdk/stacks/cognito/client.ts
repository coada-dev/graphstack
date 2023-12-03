import { Stack, StackProps } from "aws-cdk-lib";
import { IUserPool, UserPool, UserPoolClient, UserPoolClientIdentityProvider, UserPoolClientProps } from "aws-cdk-lib/aws-cognito";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

import ClientStack from "#nestedstacks/cognito/client.ts";

export default class CognitoClientStack extends Stack {
  private application: string;

  private userPool: IUserPool;

  private userPoolClient: UserPoolClient;

  constructor(scope: Construct, logicalID: string, application: string, props: StackProps) {
    super(scope, logicalID, props);
    this.application = application;

    this.userPool = UserPool.fromUserPoolId(
      this,
      "userPool",
      StringParameter.valueFromLookup(this, "/cognito/userPoolId"),
    );

    ({ userPoolClient: this.userPoolClient } = this.createClient(
      {
        supportedIdentityProviders: [
          UserPoolClientIdentityProvider.COGNITO,
          UserPoolClientIdentityProvider.GOOGLE,
        ],
        userPool: this.userPool,
      },
      ["qux:quux"]
    ));
  }

  createClient(userPoolClientProps: UserPoolClientProps, customScopes: string[] = []) {
    return new ClientStack(this, this.application, userPoolClientProps, customScopes);
  }
}
