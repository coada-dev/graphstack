/* eslint-disable no-new */

import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

interface UserPoolByRegionProps {
  readonly region: string;
  readonly userPoolClientProps: {
    readonly AllowedOAuthFlows: string[];
    readonly AllowedOAuthFlowsUserPoolClient: boolean;
    readonly AllowedOAuthScopes: string[];
    readonly CallbackURLs: string[];
    readonly ClientName: string;
    readonly ExplicitAuthFlows: string[];
    readonly LogoutURLs: string[];
    readonly PreventUserExistenceErrors: string;
    readonly SupportedIdentityProviders: string[];
    readonly UserPoolId: string;
  };
}

export default class CreateUserPoolClientByRegion extends AwsCustomResource {
  constructor(scope: Construct, name: string, props: UserPoolByRegionProps) {
    super(scope, name, {
      onCreate: {
        action: "createUserPoolClient",
        parameters: props.userPoolClientProps,
        physicalResourceId: PhysicalResourceId.of(name),
        region: props.region,
        service: "CognitoIdentityServiceProvider",
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });
  }

  getUserPoolClientId(): string {
    return this.getResponseFieldReference("UserPoolClient.ClientId").toString();
  }
}
