import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { PublicHostedZone } from "aws-cdk-lib/aws-route53";

import { branch, subdomain, tld } from "#helpers/configuration.ts";
import PublicHostedZoneStack from "#nestedstacks/r53/hostedZone.ts";

const service = "r53/publicHostedZone";
const fqdn = `${subdomain}.${tld}`;

describe(service, () => {
  let stack: Stack;
  let template: Template;
  let zone: PublicHostedZone;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const z = new PublicHostedZoneStack(wrapper, `${branch}-publicHostedZone`, {
      zoneName: fqdn,
    });

    stack = z;
    zone = z.publicHostedZone;
    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it("publicHostedZone name should equal domain", () => {
    template.hasResourceProperties("AWS::Route53::HostedZone", {
      Name: `${fqdn}.`,
    });
  });

  it(`${service} Substack validation`, () => {
    expect(zone.node.id).toEqual(`${branch}-publicHostedZone`);
  });
});
