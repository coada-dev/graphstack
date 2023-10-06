import { NestedStack } from "aws-cdk-lib";
import { SecurityGroup, SecurityGroupProps } from "aws-cdk-lib/aws-ec2";

import { Construct } from "constructs";

import { branch } from "#helpers/configuration.ts";

const namespace = `${branch}-security-group`;

export default class SecurityStack extends NestedStack {
  public readonly sg: SecurityGroup;

  constructor(
    scope: Construct,
    props: SecurityGroupProps,
  ) {
    super(scope, namespace, props);

    this.sg = new SecurityGroup(this, namespace, props);
  }
}
