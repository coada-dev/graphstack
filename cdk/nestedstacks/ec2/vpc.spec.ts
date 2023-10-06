import { App, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";

import {
  GatewayVpcEndpointAwsService,
  IpAddresses,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { BlockPublicAccess, StorageClass } from "aws-cdk-lib/aws-s3";

import { branch } from "#helpers/configuration.ts";
import VpcStack from "#nestedstacks/ec2/vpc.ts";
import S3Stack from "#nestedstacks/s3/bucket.ts";

const service = "ec2/vpc";

describe(service, () => {
  let stack: Stack;
  let template: Template;
  let vpc: Vpc;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const { bucket: vpcFlowLogStorage } = new S3Stack(
      wrapper,
      "flowlogstorage",
      {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        lifecycleRules: [
          {
            abortIncompleteMultipartUploadAfter: Duration.days(1),
            expiration: Duration.days(365),
            transitions: [
              {
                storageClass: StorageClass.INFREQUENT_ACCESS,
                transitionAfter: Duration.days(30),
              },
              {
                storageClass: StorageClass.INTELLIGENT_TIERING,
                transitionAfter: Duration.days(60),
              },
              {
                storageClass: StorageClass.GLACIER,
                transitionAfter: Duration.days(90),
              },
              {
                storageClass: StorageClass.DEEP_ARCHIVE,
                transitionAfter: Duration.days(180),
              },
            ],
          },
        ],
        removalPolicy: RemovalPolicy.DESTROY,
        serverAccessLogsPrefix: "vpcFlowlog",
      },
    );

    const v = new VpcStack(wrapper, {
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
    stack = v;
    vpc = v.vpc;

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Properties`, () => {
    template.hasResourceProperties("AWS::EC2::VPC", {
      CidrBlock: "172.0.0.0/16",
      EnableDnsHostnames: false,
      EnableDnsSupport: true,
    });
  });

  it(`${service} Log Group`, () => {
    template.hasResource("AWS::Logs::LogGroup", {
      DeletionPolicy: "Retain",
      Properties: {
        RetentionInDays: 90,
      },
      UpdateReplacePolicy: "Retain",
    });
  });

  it(`${service} Log Group IAM role/policy`, () => {
    template.hasResourceProperties("AWS::IAM::Role", {
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
              Service: "vpc-flow-logs.amazonaws.com",
            },
          },
        ],
      }),
    });

    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: [
          {
            Action: [
              "logs:CreateLogStream",
              "logs:PutLogEvents",
              "logs:DescribeLogStreams",
            ],
            Effect: "Allow",
          },
          {
            Action: "iam:PassRole",
            Effect: "Allow",
          },
        ],
      }),
    });
  });

  it(`${service} VPC Subnets`, () => {
    template.hasResourceProperties("AWS::EC2::Subnet", {
      Tags: Match.arrayWith([
        Match.objectLike({
          Key: "aws-cdk:subnet-name",
          Value: Match.stringLikeRegexp("(intra|private|public)"),
        }),
      ]),
      CidrBlock: Match.stringLikeRegexp("/24"),
      MapPublicIpOnLaunch: false,
    });
  });

  it(`${service} VPC Endpoints`, () => {
    template.hasResourceProperties("AWS::EC2::VPCEndpoint", {
      ServiceName: {
        "Fn::Join": Match.arrayWith([
          "",
          ["com.amazonaws.", { Ref: "AWS::Region" }, ".dynamodb"],
        ]),
      },
    });

    template.hasResourceProperties("AWS::EC2::VPCEndpoint", {
      ServiceName: {
        "Fn::Join": Match.arrayWith([
          "",
          ["com.amazonaws.", { Ref: "AWS::Region" }, ".s3"],
        ]),
      },
    });
  });

  it(`${service} Flow Logs`, () => {
    template.hasResourceProperties("AWS::EC2::FlowLog", {
      LogDestination: {
        Ref: Match.stringLikeRegexp("flowlogstorage"),
      },
      LogDestinationType: "s3",
      ResourceType: "VPC",
      TrafficType: "ALL",
    });

    template.hasResourceProperties("AWS::EC2::FlowLog", {
      LogDestinationType: "cloud-watch-logs",
      ResourceType: "VPC",
      TrafficType: "ALL",
    });
  });

  it(`${service} Substack validation`, () => {
    expect(vpc.node.id).toEqual("vpc");
  });
});
