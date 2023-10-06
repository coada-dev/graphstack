import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { ComparisonOperator } from "aws-cdk-lib/aws-cloudwatch";

import { fqdn } from "#helpers/configuration.ts";
import CertificateStack from "#nestedstacks/acm/certificate.ts";
import PublicHostedZoneStack from "#nestedstacks/r53/hostedZone.ts";

const service = "certificateStack";

describe(service, () => {
  let certificate: Certificate;
  let stack: CertificateStack;
  let template: Template;

  const namespace = "FooCertificate";

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);
    const domainName = `*.${fqdn}`;

    const { publicHostedZone }: PublicHostedZoneStack =
      new PublicHostedZoneStack(wrapper, "hostedZone", {
        zoneName: fqdn,
      });

    stack = new CertificateStack(wrapper, domainName.replace(/\./g, "-"), {
      domainName,
      validation: CertificateValidation.fromDns(publicHostedZone),
    });

    certificate = stack.certificate;
    stack.createAlarm();

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Certificate`, () => {
    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
      DomainName: `*.${fqdn}`,
      ValidationMethod: "DNS",
    });
  });

  it(`${service} Alarm`, () => {
    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      ComparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
      MetricName: "DaysToExpiry",
      Period: 86400,
      Threshold: 45,
    });
  });

  it(`${service} Substack validation`, () => {
    expect(certificate.node.id).toEqual(`*.${fqdn}`.replace(/\./g, "-"));
  });
});
