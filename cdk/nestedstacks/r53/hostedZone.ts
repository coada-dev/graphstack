import { NestedStack } from "aws-cdk-lib";
import {
  PublicHostedZone,
  PublicHostedZoneProps,
} from "aws-cdk-lib/aws-route53";

import { Construct } from "constructs";

export default class PublicHostedZoneStack extends NestedStack {
  public readonly publicHostedZone: PublicHostedZone;

  constructor(
    scope: Construct,
    namespace: string,
    publicHostedZoneProps: PublicHostedZoneProps,
  ) {
    super(scope, namespace, {});

    this.publicHostedZone = new PublicHostedZone(
      this,
      namespace,
      publicHostedZoneProps,
    );
  }
}
