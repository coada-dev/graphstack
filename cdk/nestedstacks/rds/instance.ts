import { NestedStack, RemovalPolicy, StackProps } from "aws-cdk-lib";
import { Port } from "aws-cdk-lib/aws-ec2";
import { DatabaseInstance, DatabaseInstanceProps } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

import { environment, region } from "#helpers/configuration.ts";
import { isProd } from "#helpers/environment.ts";

export default class RDSInstanceStack extends NestedStack {
  private readonly instance: DatabaseInstance;

  private isProduction: boolean = isProd(environment);

  constructor(scope: Construct, props: DatabaseInstanceProps) {
    super(scope, "instance", {});

    this.instance = this.createInstance(props);
    this.instance.connections.allowFromAnyIpv4(Port.tcp(5432));
  }

  createInstance(props: DatabaseInstanceProps) {
    return new DatabaseInstance(this, "Database", props); 
  }
}
