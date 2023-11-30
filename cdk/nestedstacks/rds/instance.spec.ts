import { App, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

import { formatCDKLogicalID } from "#helpers/cdk.ts";
import { environment, fqdn } from "#helpers/configuration.ts";
import { isProd } from "#helpers/environment.ts";
import VpcStack from "#nestedstacks/ec2/vpc.ts";
import PostgresDistributionStack from "#nestedstacks/rds/instance.ts";
import { InstanceClass, InstanceSize, InstanceType, IpAddresses, SubnetType } from "aws-cdk-lib/aws-ec2";
import { DatabaseInstanceEngine } from "aws-cdk-lib/aws-rds";

const service = "rds/instance";
const formattedFQDN = formatCDKLogicalID(fqdn);

describe(service, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const secret = new Secret(wrapper, "credentials", {
        generateSecretString: {
            excludeCharacters: '/@"',
            generateStringKey: "password",
            secretStringTemplate: JSON.stringify({
                username: "username",
            }),
        }
    });

    const { vpc } = new VpcStack(wrapper, {
      ipAddresses: IpAddresses.cidr("172.0.0.0/16"),
      enableDnsHostnames: false,
      enableDnsSupport: true,
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

    const s = new PostgresDistributionStack(
      wrapper,
      {
      allocatedStorage: 1,
      credentials: {
        username: "username",
        password: secret.secretValueFromJson("password"),
      },
      databaseName: "grafbase",
      deletionProtection: isProd(environment),
      engine: DatabaseInstanceEngine.POSTGRES,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      multiAz: false,
      port: 5432,
      removalPolicy: RemovalPolicy.DESTROY,
      storageEncrypted: true,
      vpc,
    },
    );

    stack = s;
    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Properties`, () => {
    template.hasResourceProperties("AWS::EC2::SecurityGroup", {
      SecurityGroupEgress: Match.arrayWith([Match.objectLike({
        CidrIp: "0.0.0.0/0",
        IpProtocol: "-1",
      })])
    });

    template.hasResourceProperties("AWS::RDS::DBInstance", {
        AllocatedStorage: "1",
        DBInstanceClass: "db.t3.micro",
        DBName: "grafbase",
        Engine: "postgres",
        Port: "5432",
        StorageEncrypted: true,
        StorageType: "gp2",
    });
  });
});
