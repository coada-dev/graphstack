import { Stack, StackProps } from "aws-cdk-lib";
import { IVpc, Peer, Port, Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

import { Construct } from "constructs";

import handleOutputs from "#helpers/outputs.ts";

import { branch, region } from "#helpers/configuration.ts";

import SecurityGroupStack from "#nestedstacks/ec2/security-group.ts";

export default class VPCSecurityStack extends Stack {
  constructor(scope: Construct, logicalID: string, props?: StackProps) {
    super(scope, logicalID, props);

    const { sg } = new SecurityGroupStack(this, "apiGWDefault", {
      vpc: this.getVPC(),
    });
    sg.connections.allowFrom(Peer.anyIpv4(), Port.tcp(443));

    handleOutputs(
      this,
      {
        label: "apiGWSecurityGroupID",
        region,
        service: "ec2/sg",
      },
      sg.securityGroupId,
    );
  }

  getVPC(): IVpc {
    const vpcId = process.env.CDK_VPC_ID
      || StringParameter.valueFromLookup(this, `/vpc/${branch}-vpcId`);

    return Vpc.fromLookup(this, "vpc", { vpcId });
  }
}
