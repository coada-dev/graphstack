import { Stack, StackProps } from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Passwordless } from "amazon-cognito-passwordless-auth/cdk";

import { Construct } from "constructs";

import { branch, domain, environment, fqdn, region, tld } from "#helpers/configuration.ts";
import handleOutputs from "#helpers/outputs.ts";
import { Ports } from "#helpers/ports.ts";

export default class CognitoUserPoolClientStackPasswordless extends Stack {
  constructor(scope: Construct, logicalID: string, userPool: UserPool, props?: StackProps) {
    super(scope, logicalID, props);
  }

  public static createPasswordlessClient(
    scope: Construct,
    userPool: UserPool,
    client: {
      application: string,
      userPoolClient: UserPoolClient,
    },
  ) {
    const passwordless = new Passwordless(scope, "client-passwordless", {
      userPool,
      allowedOrigins: [
        `https://${branch}.${client.application}.${fqdn}/idp/callback`,
        `https://${branch}.${client.application}.${domain}.${tld}:${Ports.vite}`,
      ],
      magicLink: {
        sesFromAddress: `no-reply@${domain}.${tld}`,
      },
      fido2: {
        allowedRelyingPartyIds: [
          `${domain}.${tld}`,
          fqdn,
        ]
      },
      userPoolClients: [client.userPoolClient],
    });

    handleOutputs(
      scope,
      {
        label: `${branch}-${client.application}-passwordlessClientId`,
        region,
        service: "cognito",
      },
      passwordless.userPoolClients!.at(0)!.userPoolClientId,
    );

    handleOutputs(
      scope,
      {
        label: `${branch}-${client.application}-passwordlessFido2URI`,
        region,
        service: "cognito",
      },
      passwordless.fido2Api!.url!,
    );
  }
}
