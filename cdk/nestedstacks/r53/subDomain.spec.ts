import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";

import { formatCDKLogicalID } from "#helpers/cdk.ts";
import { fqdn } from '#helpers/configuration.ts';
import SubDNSStack from "#nestedstacks/r53/subDomain.ts";

const service = "r53/domain";
const formattedFQDN = formatCDKLogicalID(`subdomain.${fqdn}`);

describe(service, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);
    const s = new SubDNSStack(
      wrapper,
      formattedFQDN,
      {
        comment: "subdomain",
        zoneName: `subdomain.${fqdn}`,
      },
    );

    stack = s;
    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Will Have Delegation Properties for Higher Environments`, () => {
    template.hasResourceProperties("AWS::Route53::HostedZone", {
      Name: `subdomain.${fqdn}.`,
    });

    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyName: Match.stringLikeRegexp("delegation"),
    });

    template.hasResourceProperties("Custom::CrossAccountZoneDelegation", {
      DelegatedZoneName: `subdomain.${fqdn}`,
    });

    template.hasResource("AWS::CloudFormation::Stack", {
      DeletionPolicy: "Delete",
    });

    template.hasResourceProperties("AWS::SSM::Parameter", {
      Name: `/acm/${formattedFQDN}-certificate` || `/${service}/${formattedFQDN}-hostedZone`,
    });
  });
});