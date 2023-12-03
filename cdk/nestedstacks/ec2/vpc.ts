import { NestedStack, Tags } from "aws-cdk-lib";
import { FlowLogDestination, Vpc, VpcProps } from "aws-cdk-lib/aws-ec2";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Bucket } from "aws-cdk-lib/aws-s3";

import { Construct } from "constructs";

import { branch, region } from "#helpers/configuration.ts";
import handleOutputs, { handleOutputsList } from "#helpers/outputs.ts";

export default class VpcStack extends NestedStack {
  protected flowLogRole: Role;

  protected logGroup: LogGroup;

  protected storageBucket: Bucket;

  public readonly vpc: Vpc;

  constructor(
    scope: Construct,
    props: VpcProps,
    storageBucket?: Bucket,
  ) {
    super(scope, "vpc", {});

    this.vpc = new Vpc(this, "vpc", props);

    if (storageBucket) {
      this.storageBucket = storageBucket;
      this.createFlowLogRole();
      this.createLogGroup();
      this.addFlowLogs();
    }

    this.tagSubnets();
    this.outputs();
  }

  addFlowLogs() {
    this.vpc.addFlowLog("FlowLogS3", {
      destination: FlowLogDestination.toS3(this.storageBucket),
    });

    this.vpc.addFlowLog("FlowLogCloudWatch", {
      destination: FlowLogDestination.toCloudWatchLogs(
        this.logGroup,
        this.flowLogRole,
      ),
    });
  }

  createLogGroup() {
    this.logGroup = new LogGroup(this, "flowLogCloudWatch", {
      retention: RetentionDays.THREE_MONTHS,
    });
  }


  createFlowLogRole() {
    this.flowLogRole = new Role(this, "flowLogRole", {
      assumedBy: new ServicePrincipal("vpc-flow-logs.amazonaws.com"),
    });
  }

  outputs() {
    handleOutputsList(
      this,
      {
        label: "vpcIsolatedSubnets",
        region,
        service: "vpc",
      },
      this.vpc.isolatedSubnets.map((s) => s.subnetId),
    );
    handleOutputsList(
      this,
      {
        label: "vpcPrivateSubnets",
        region,
        service: "vpc",
      },
      this.vpc.privateSubnets.map((s) => s.subnetId),
    );
    handleOutputsList(
      this,
      {
        label: "vpcPublicSubnets",
        region,
        service: "vpc",
      },
      this.vpc.publicSubnets.map((s) => s.subnetId),
    );
    handleOutputs(
      this,
      { label: "vpcId", region, service: "vpc" },
      this.vpc.vpcId,
    );
  }

  tagSubnets() {
    [
      { tag: "isolatedSubnets", subnet: this.vpc.isolatedSubnets },
      { tag: "privateSubnets", subnet: this.vpc.privateSubnets },
      { tag: "publicSubnets", subnet: this.vpc.publicSubnets },
    ].forEach((type) => {
      type.subnet.forEach((subnet) => {
        Tags.of(subnet).add("name", type.tag);
      });
    });
  }
}
