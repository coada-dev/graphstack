import { RemovalPolicy, Stack } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  CrossAccountZoneDelegationRecord,
  HostedZoneProps,
  PublicHostedZone,
} from "aws-cdk-lib/aws-route53";
import { Role } from "aws-cdk-lib/aws-iam";

import { Construct } from "constructs";

import { account, branch, region } from "#helpers/configuration.ts";
import { Region } from "#helpers/region.ts";
import SSMParameterReader from "#nestedstacks/custom/ssmByRegion.ts";
import DNSStack from "#nestedstacks/r53/domain.ts";

export default class SubDNSStack extends DNSStack {
  public certificate: Certificate;

  public publicHostedZone: PublicHostedZone;

  private subdomain: string;

  constructor(
    scope: Construct,
    logicalID: string,
    props: HostedZoneProps,
  ) {
    super(scope, logicalID, props);

    this.subdomain = props.zoneName.split(".").slice(1).join(".");
    this.publicHostedZone = this.createDomain(props);
    this.handleDelegation();
    this.certificate = this.createCertificate(
      props,
      this.publicHostedZone,
    ).certificate;
  }

  handleDelegation(regionOverride?: Region) {
    const parentHostedZoneId = new SSMParameterReader(
      this,
      "parentHostedZoneId",
      {
        parameterName: `/r53/${this.subdomain.replace(/\./g, "-")}-hostedZone`,
        region: regionOverride || region,
      },
    );

    const parentPublicHostedZone = PublicHostedZone.fromHostedZoneId(
      this,
      "parentZone",
      parentHostedZoneId.getParameterValue(),
    );

    const delegationRoleArn = Stack.of(this).formatArn({
      region: "",
      service: "iam",
      account,
      resource: "role",
      resourceName: `${branch}-delegate-role`,
    });
    const delegationRole = Role.fromRoleArn(
      this,
      "delegationRole",
      delegationRoleArn,
    );

    // eslint-disable-next-line no-new
    new CrossAccountZoneDelegationRecord(this, "delegationRecord", {
      delegatedZone: this.publicHostedZone,
      parentHostedZoneId: parentPublicHostedZone.hostedZoneId,
      delegationRole,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
