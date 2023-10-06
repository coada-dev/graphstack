import { NestedStack } from "aws-cdk-lib";
import { CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { AccountPrincipal, Role } from "aws-cdk-lib/aws-iam";
import { HostedZoneProps, PublicHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

import { formatCDKLogicalID } from "#helpers/cdk.ts";
import { account, branch, region } from "#helpers/configuration.ts";
import handleOutputs from "#helpers/outputs.ts";
import CertificateStack from "#nestedstacks/acm/certificate.ts";

// NOTE: environment subdomains only, service subdomains use SubDNSStack
export default class DNSStack extends NestedStack {
  private namespace: string;

  public readonly publicHostedZone: PublicHostedZone;

  constructor(
    scope: Construct,
    logicalID: string,
    props: HostedZoneProps,
  ) {
    super(scope, logicalID, {});

    this.namespace = formatCDKLogicalID(props.zoneName);
    // NOTE check for environment, not service, subdomain only
    if (props.zoneName.split(".").length === 3) {
      this.publicHostedZone = this.createDomain(props);

      try {
        // NOTE: will fail on LocalStack
        const principal = new AccountPrincipal(account);
        const role = new Role(this, "delegate-role", {
          roleName: `${branch}-delegate-role`,
          assumedBy: principal,
        });

        this.publicHostedZone.grantDelegation(role);
      } catch (error) {
        console.warn(error);
      }

      this.createCertificate(props, this.publicHostedZone);
    }
  }

  createCertificate(
    props: HostedZoneProps,
    zone: PublicHostedZone,
  ) {
    const certificateStack = new CertificateStack(this, `${this.namespace}-certificate`, {
      domainName: `*.${props.zoneName}`,
      validation: CertificateValidation.fromDns(zone),
    });

    handleOutputs(
      this,
      {
        label: `${this.namespace}-certificate`,
        region,
        service: "acm",
      },
      certificateStack.certificate.certificateArn,
    );

    return certificateStack;
  }

  createDomain(props: HostedZoneProps) {
    const zone: PublicHostedZone = new PublicHostedZone(this, `${this.namespace}-hostedZone`, {
      zoneName: props.zoneName,
    });

    handleOutputs(
      this,
      {
        label: `${this.namespace}-hostedZone`,
        region,
        service: "r53",
      },
      zone.hostedZoneId,
    );

    return zone;
  }
}
