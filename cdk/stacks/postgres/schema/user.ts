import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { InstanceClass, InstanceSize, InstanceType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Credentials, DatabaseInstanceEngine, DatabaseSecret, SubnetGroup } from "aws-cdk-lib/aws-rds";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

import { environment, region } from "#helpers/configuration.ts";
import { isProd } from "#helpers/environment.ts";

import RDSInstanceStack from "#nestedstacks/rds/instance.ts";

export default class PostgresDistributionStack extends Stack {
  private isProduction: boolean = isProd(environment);

  constructor(scope: Construct, logicalID: string, props: StackProps) {
    super(scope, logicalID, props);

    const vpcId = StringParameter.valueFromLookup(this, "/vpc/vpcId");
    const vpc = Vpc.fromLookup(this, "VPC", { vpcId });
    const username = process.env.CDK_AWS_RDS_USERNAME || "username";

    new DatabaseSecret(this, "credentials", { username });
    new RDSInstanceStack(this, {
      allocatedStorage: 1,
      credentials: Credentials.fromUsername(username),
      databaseName: "grafbase",
      deletionProtection: this.isProduction,
      engine: DatabaseInstanceEngine.POSTGRES,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      multiAz: false,
      port: 5432,
      removalPolicy: this.isProduction
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      storageEncrypted: true,
      subnetGroup: SubnetGroup.fromSubnetGroupName(this, "subnetGroup", `${environment}-pg-default`),
      vpc,
    });
  }
}
