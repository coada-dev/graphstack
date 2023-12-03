import { Stack, StackProps } from "aws-cdk-lib";
import { UserPool, UserPoolClientIdentityProvider } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

import { environment } from "#helpers/configuration.ts";
import { isProd } from "#helpers/environment.ts";
import ClientStack from "#nestedstacks/cognito/client.ts";
import UserPoolStack from "#nestedstacks/cognito/userpool.ts";
import CognitoUserPoolClientStackPasswordless from "#nestedstacks/cognito/clients/passwordless.ts";

export default class CognitoUserPoolStack extends Stack {
  public readonly isProduction: boolean = isProd(environment);

  public readonly userPool: UserPool;

  constructor(scope: Construct, logicalID: string, props?: StackProps) {
    super(scope, logicalID, props);

    ({ userPool: this.userPool } = new UserPoolStack(this, {
      userPoolName: environment,
    }));

    // NOTE: add Fido2 settings to default client
    const application = "default";
    const { userPoolClient } = new ClientStack(this, application, {
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
        UserPoolClientIdentityProvider.GOOGLE,
      ],
      userPool: this.userPool,
    });

    // NOTE: AWS-provided client doesn't accept userPool Interfaces
    // requires physical pool construct
    // CognitoUserPoolClientStackPasswordless.createPasswordlessClient(
    //   this,
    //   this.userPool,
    //   { application, userPoolClient }
    // );
  }
}
