import { App, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { SSLMethod, SecurityPolicyProtocol } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ObjectOwnership } from "aws-cdk-lib/aws-s3";

import { branch, environment, region, subdomain } from "#helpers/configuration.ts";
import DistributionStack from "#nestedstacks/cf/origins/s3/distribution.ts";
import CertificateStack from "#nestedstacks/acm/certificate.ts";
import PublicHostedZoneStack from "#nestedstacks/r53/hostedZone.ts";
import S3Stack from "#nestedstacks/s3/bucket.ts";

const application = "application";
const domain = `service.${environment}.${subdomain}`;
const service = "cf/distribution";

describe(service, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const { publicHostedZone }: PublicHostedZoneStack =
      new PublicHostedZoneStack(wrapper, "hostedZone", {
        zoneName: domain,
      });

    const { certificate } = new CertificateStack(wrapper, "certificate", {
      domainName: `*.${domain}`,
      validation: CertificateValidation.fromDns(publicHostedZone),
    });

    const s = new DistributionStack(wrapper, `${branch}-${application}`, {});

    const { bucket } = s.createOrigin();
    s.createDistribution({
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originPath: process.env.GITHUB_SHA || "/",
        }),
      },
      certificate,
      defaultRootObject: "index.html",
      domainNames: [`context.${domain}`],
      enableLogging: true,
      logBucket: new S3Stack(wrapper, `${branch}-dist-log`, {
        autoDeleteObjects: true,
        objectOwnership: ObjectOwnership.OBJECT_WRITER,
        removalPolicy: RemovalPolicy.DESTROY,
      }).bucket,
      logFilePrefix: `${branch}-distribution`,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      sslSupportMethod: SSLMethod.SNI,
    });

    stack = s;
    template = Template.fromStack(stack);
    // console.log(template, "template"); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Properties`, () => {
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        Aliases: [`context.${domain}`],
        DefaultCacheBehavior: {
          Compress: true,
          ViewerProtocolPolicy: "allow-all",
        },
        Enabled: true,
        Logging: {
          Prefix: `${branch}-distribution`,
        },
        Origins: [
          {
            Id: Match.stringLikeRegexp(`${branch.replace(/-/g, "")}`),
          },
        ],
        ViewerCertificate: {
          MinimumProtocolVersion: "TLSv1.2_2021",
          SslSupportMethod: "sni-only",
        },
      },
    });
  });
});
