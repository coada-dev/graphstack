import { Stack, StackProps } from "aws-cdk-lib";
import { GatewayVpcEndpointAwsService, IpAddresses, SubnetType } from "aws-cdk-lib/aws-ec2";
import { EmailIdentity, Identity } from "aws-cdk-lib/aws-ses";
import { Construct } from "constructs";

import { formatCDKLogicalID } from "#helpers/cdk.ts";
import { environment, fqdn } from "#helpers/configuration.ts";
import { isProd } from "#helpers/environment.ts";
import VpcStack from "#nestedstacks/ec2/vpc.ts";
import DNSStack from "#nestedstacks/r53/domain.ts";
import SubDNSStack from "#nestedstacks/r53/subDomain.ts";

export default class EnvironmentStack extends Stack {
  public readonly isProduction: boolean = isProd(environment);

  constructor(scope: Construct, logicalID: string, props?: StackProps) {
    super(scope, logicalID, props);

    // NOTE: <environment>.<domain>.<tld>
    // defined in configuration.ts helper
    const { publicHostedZone: primarySubdomain }  = new DNSStack(
      this,
      formatCDKLogicalID(fqdn),
      {
        zoneName: fqdn,
      },
    );

    const { publicHostedZone: mailSubdomain } = new SubDNSStack(
      this,
      formatCDKLogicalID(`mail.${fqdn}`),
      {
        zoneName: `mail.${fqdn}`,
      }
    );
    mailSubdomain.node.addDependency(primarySubdomain);

    const ses = new EmailIdentity(this, "ses-identity", {
      identity: Identity.publicHostedZone(primarySubdomain),
      mailFromDomain: `mail.${fqdn}`,
    });
    ses.node.addDependency(mailSubdomain);

    const { vpc }: VpcStack = new VpcStack(this, {
      ipAddresses: IpAddresses.cidr("172.0.0.0/16"),
      enableDnsHostnames: false,
      enableDnsSupport: true,
      gatewayEndpoints: {
        dynamoDB: {
          service: GatewayVpcEndpointAwsService.DYNAMODB,
          subnets: [{ subnetType: SubnetType.PRIVATE_WITH_EGRESS }],
        },
        s3: {
          service: GatewayVpcEndpointAwsService.S3,
          subnets: [{ subnetType: SubnetType.PRIVATE_WITH_EGRESS }],
        },
      },
      maxAzs: this.isProduction ? 5 : 2,
      natGateways: this.isProduction ? 5 : 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "private",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: "intra",
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
