import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";

import {
  GatewayVpcEndpointAwsService,
  IpAddresses,
  Peer,
  Port,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";

import VpcStack from "#nestedstacks/ec2/vpc.ts";
import SecurityStack from "#nestedstacks/ec2/security-group.ts";
import S3Stack from "#nestedstacks/s3/bucket.ts";

const service = "vpcSecurityGroups";

describe(service, () => {
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const { bucket: vpcFlowLogStorage } = new S3Stack(
      wrapper,
      "vpcflowlogstorage",
      {},
    );
    const { vpc }: VpcStack = new VpcStack(wrapper, {
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
    }, vpcFlowLogStorage);

    const stack = new SecurityStack(wrapper, { vpc });

    stack.sg.connections.allowFrom(Peer.anyIpv4(), Port.tcp(443));

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} default egress rule`, () => {
    template.hasResourceProperties("AWS::EC2::SecurityGroup", {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({
          CidrIp: "0.0.0.0/0",
          IpProtocol: "-1",
        }),
      ]),
    });
  });

  it(`${service} attached ingress rule`, () => {
    template.hasResourceProperties("AWS::EC2::SecurityGroup", {
      SecurityGroupIngress: Match.arrayWith([
        Match.objectLike({
          CidrIp: "0.0.0.0/0",
          FromPort: 443,
          ToPort: 443,
        }),
      ]),
    });
  });
});
