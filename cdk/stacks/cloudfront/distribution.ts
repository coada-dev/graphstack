import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import ClientStack from "#nestedstacks/cognito/client.ts";

export default class CloudfrontDistributionStack extends Stack {
  constructor(scope: Construct, logicalID: string, application: string, props: StackProps) {
    super(scope, logicalID, props);

  }
}
