import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";

import { formatCDKLogicalID } from "#helpers/cdk.ts";
import { branch, environment, fqdn } from "#helpers/configuration.ts";
import DNSStack from "#nestedstacks/r53/domain.ts";

const service = "r53/domain";
const formattedFQDN = formatCDKLogicalID(fqdn);

describe(service, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);
    const s = new DNSStack(
      wrapper,
      formattedFQDN,
      {
        comment: environment,
        zoneName: fqdn,
      },
    );

    stack = s;
    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Properties`, () => {
    template.hasResourceProperties("AWS::Route53::HostedZone", {
      Name: `${fqdn}.`,
    });

    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: `${branch}-delegate-role`,
    });

    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyName: Match.stringLikeRegexp("delegate"),
    });

    template.hasResourceProperties("AWS::SSM::Parameter", {
      Name: `/acm/${formattedFQDN}-certificate` || `/${service}/domain-${formattedFQDN}-hostedZone`,
    });
  });
});
