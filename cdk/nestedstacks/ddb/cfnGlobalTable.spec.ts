import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";

import {
  CfnGlobalTable as Table,
  BillingMode,
  StreamViewType,
} from "aws-cdk-lib/aws-dynamodb";

import CfnGlobalTableStack from "#nestedstacks/ddb/cfnGlobalTable.ts";

import { branch, environment } from "#helpers/configuration.ts";
import { Environment } from "#helpers/environment.ts";
import { getRegions } from "#helpers/region.ts";

const service = "dynamodb";

describe(service, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const isProduction: boolean =
      Environment[environment as keyof typeof Environment] ===
      Environment.production;

    const autoScaleFactor = 0.65;
    const capacityMultiplier = isProduction ? 10 : 2;
    const readCapacity = isProduction ? 5 : 2;
    const writeCapacity = isProduction ? 5 : 2;

    stack = new CfnGlobalTableStack(wrapper, {
      attributeDefinitions: [
        {
          attributeName: "id",
          attributeType: "S",
        },
      ],
      billingMode: BillingMode.PROVISIONED,
      keySchema: [
        {
          attributeName: "id",
          keyType: "HASH",
        },
      ],
      replicas: getRegions(environment).map((region: string) => ({
        contributorInsightsSpecification: {
          enabled: true,
        },
        deletionProtectionEnabled: isProduction,
        pointInTimeRecoverySpecification: {
          pointInTimeRecoveryEnabled: isProduction,
        },
        region,
        readProvisionedThroughputSettings: {
          readCapacityAutoScalingSettings: {
            maxCapacity: capacityMultiplier * readCapacity,
            minCapacity: readCapacity,
            seedCapacity: readCapacity,
            targetTrackingScalingPolicyConfiguration: {
              targetValue: Math.floor(readCapacity * autoScaleFactor),
            },
          },
          readCapacityUnits: 5,
        },
      })),
      streamSpecification: {
        streamViewType: StreamViewType.NEW_AND_OLD_IMAGES,
      },
      tableName: `${service}-foo`,
      writeProvisionedThroughputSettings: {
        writeCapacityAutoScalingSettings: {
          maxCapacity: capacityMultiplier * writeCapacity,
          minCapacity: writeCapacity,
          seedCapacity: writeCapacity,
          targetTrackingScalingPolicyConfiguration: {
            targetValue: Math.floor(writeCapacity * autoScaleFactor),
          },
        },
      },
    });

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} With Full Table Properties`, () => {
    template.hasResourceProperties("AWS::DynamoDB::GlobalTable", {
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      BillingMode: "PROVISIONED",
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      Replicas: Match.arrayWith([
        {
          ContributorInsightsSpecification: {
            Enabled: true,
          },
          DeletionProtectionEnabled: false,
          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: false,
          },
          ReadProvisionedThroughputSettings: {
            ReadCapacityAutoScalingSettings: {
              MaxCapacity: 4,
              MinCapacity: 2,
              SeedCapacity: 2,
              TargetTrackingScalingPolicyConfiguration: {
                TargetValue: 1,
              },
            },
            ReadCapacityUnits: 5,
          },
          Region: "us-west-2",
        },
      ]),
      SSESpecification: {
        SSEEnabled: true,
      },
      StreamSpecification: {
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
      TableName: `${service}-foo`,
      WriteProvisionedThroughputSettings: {
        WriteCapacityAutoScalingSettings: {
          MaxCapacity: 4,
          MinCapacity: 2,
        },
      },
    });
  });
});

describe(service, () => {
  let stack: Stack;

  it(`${service} Should Throw Error`, () => {
    const app = new App();
    const wrapper = new Stack(app);

    const isProduction: boolean =
      Environment[environment as keyof typeof Environment] ===
      Environment.production;

    const autoScaleFactor = 0.65;
    const capacityMultiplier = isProduction ? 10 : 2;
    const readCapacity = isProduction ? 5 : 2;
    const writeCapacity = isProduction ? 5 : 2;

    try {
      stack = new CfnGlobalTableStack(wrapper, {
        attributeDefinitions: [
          {
            attributeName: "id",
            attributeType: "S",
          },
        ],
        billingMode: BillingMode.PROVISIONED,
        keySchema: [
          {
            attributeName: "id",
            keyType: "HASH",
          },
        ],
        replicas: getRegions(environment).map((region: string) => ({
          contributorInsightsSpecification: {
            enabled: true,
          },
          deletionProtectionEnabled: isProduction,
          pointInTimeRecoverySpecification: {
            pointInTimeRecoveryEnabled: isProduction,
          },
          region,
          readProvisionedThroughputSettings: {
            readCapacityAutoScalingSettings: {
              maxCapacity: capacityMultiplier * readCapacity,
              minCapacity: readCapacity,
              seedCapacity: readCapacity,
              targetTrackingScalingPolicyConfiguration: {
                targetValue: Math.floor(readCapacity * autoScaleFactor),
              },
            },
            readCapacityUnits: 5,
          },
        })),
        streamSpecification: {
          streamViewType: StreamViewType.NEW_AND_OLD_IMAGES,
        },
        writeProvisionedThroughputSettings: {
          writeCapacityAutoScalingSettings: {
            maxCapacity: capacityMultiplier * writeCapacity,
            minCapacity: writeCapacity,
            seedCapacity: writeCapacity,
            targetTrackingScalingPolicyConfiguration: {
              targetValue: Math.floor(writeCapacity * autoScaleFactor),
            },
          },
        },
      });

      Template.fromStack(stack);
      // console.log(template, 'template'); //?
      // console.log(template.toJSON(), 'json');
    } catch (error: unknown) {
      const message = (<Error>error).message as string;

      expect(message).toEqual("Property tableName is required");
    }
  });
});

describe(service, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const isProduction: boolean =
      Environment[environment as keyof typeof Environment] ===
      Environment.production;

    const autoScaleFactor = 0.65;
    const capacityMultiplier = isProduction ? 10 : 2;
    const readCapacity = isProduction ? 5 : 2;
    const writeCapacity = isProduction ? 5 : 2;

    stack = new CfnGlobalTableStack(wrapper, {
      attributeDefinitions: [
        {
          attributeName: "id",
          attributeType: "S",
        },
      ],
      billingMode: BillingMode.PROVISIONED,
      globalSecondaryIndexes: [
        {
          indexName: "indexName",
          keySchema: [
            {
              attributeName: "attributeName",
              keyType: "keyType",
            },
          ],
          projection: {
            nonKeyAttributes: ["nonKeyAttributes"],
            projectionType: "projectionType",
          },

          // the properties below are optional
          writeProvisionedThroughputSettings: {
            writeCapacityAutoScalingSettings: {
              maxCapacity: 123,
              minCapacity: 123,
              targetTrackingScalingPolicyConfiguration: {
                targetValue: 123,

                // the properties below are optional
                disableScaleIn: false,
                scaleInCooldown: 123,
                scaleOutCooldown: 123,
              },

              // the properties below are optional
              seedCapacity: 123,
            },
          },
        },
      ],
      keySchema: [
        {
          attributeName: "id",
          keyType: "HASH",
        },
      ],
      replicas: getRegions(environment).map((region: string) => ({
        contributorInsightsSpecification: {
          enabled: true,
        },
        deletionProtectionEnabled: isProduction,
        pointInTimeRecoverySpecification: {
          pointInTimeRecoveryEnabled: isProduction,
        },
        region,
        readProvisionedThroughputSettings: {
          readCapacityAutoScalingSettings: {
            maxCapacity: capacityMultiplier * readCapacity,
            minCapacity: readCapacity,
            seedCapacity: readCapacity,
            targetTrackingScalingPolicyConfiguration: {
              targetValue: Math.floor(readCapacity * autoScaleFactor),
            },
          },
          readCapacityUnits: 5,
        },
      })),
      streamSpecification: {
        streamViewType: StreamViewType.NEW_AND_OLD_IMAGES,
      },
      tableName: `${service}-foo`,
      writeProvisionedThroughputSettings: {
        writeCapacityAutoScalingSettings: {
          maxCapacity: capacityMultiplier * writeCapacity,
          minCapacity: writeCapacity,
          seedCapacity: writeCapacity,
          targetTrackingScalingPolicyConfiguration: {
            targetValue: Math.floor(writeCapacity * autoScaleFactor),
          },
        },
      },
    });

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json'); //?
  });

  it(`${service} With GSI Table Properties`, () => {
    template.hasResourceProperties("AWS::DynamoDB::GlobalTable", {
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      BillingMode: "PROVISIONED",
      GlobalSecondaryIndexes: Match.arrayWith([
        {
          IndexName: "indexName",
          KeySchema: [
            {
              AttributeName: "attributeName",
              KeyType: "keyType",
            },
          ],
          Projection: {
            NonKeyAttributes: ["nonKeyAttributes"],
            ProjectionType: "projectionType",
          },
          WriteProvisionedThroughputSettings: {
            WriteCapacityAutoScalingSettings: {
              MaxCapacity: 123,
              MinCapacity: 123,
              TargetTrackingScalingPolicyConfiguration: {
                TargetValue: 123,
                DisableScaleIn: false,
                ScaleInCooldown: 123,
                ScaleOutCooldown: 123,
              },
              SeedCapacity: 123,
            },
          },
        },
      ]),
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      Replicas: Match.arrayWith([
        {
          ContributorInsightsSpecification: {
            Enabled: true,
          },
          DeletionProtectionEnabled: false,
          GlobalSecondaryIndexes: Match.arrayWith([
            {
              ContributorInsightsSpecification: {
                Enabled: true,
              },
              IndexName: "indexName",
              ReadProvisionedThroughputSettings: {
                ReadCapacityAutoScalingSettings: {
                  MaxCapacity: 4,
                  MinCapacity: 2,
                  SeedCapacity: 2,
                  TargetTrackingScalingPolicyConfiguration: {
                    TargetValue: 1,
                  },
                },
                ReadCapacityUnits: 5,
              },
            },
          ]),
          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: false,
          },
          ReadProvisionedThroughputSettings: {
            ReadCapacityAutoScalingSettings: {
              MaxCapacity: 4,
              MinCapacity: 2,
              SeedCapacity: 2,
              TargetTrackingScalingPolicyConfiguration: {
                TargetValue: 1,
              },
            },
            ReadCapacityUnits: 5,
          },
          Region: "us-west-1",
        },
      ]),
      SSESpecification: {
        SSEEnabled: true,
      },
      StreamSpecification: {
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
      TableName: `${service}-foo`,
      WriteProvisionedThroughputSettings: {
        WriteCapacityAutoScalingSettings: {
          MaxCapacity: 4,
          MinCapacity: 2,
        },
      },
    });
  });
});

describe(service, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const isProduction: boolean =
      Environment[environment as keyof typeof Environment] ===
      Environment.production;

    const autoScaleFactor = 0.65;
    const capacityMultiplier = isProduction ? 10 : 2;
    const readCapacity = isProduction ? 5 : 2;
    const writeCapacity = isProduction ? 5 : 2;

    stack = new CfnGlobalTableStack(wrapper, {
      attributeDefinitions: [
        {
          attributeName: "id",
          attributeType: "S",
        },
      ],
      billingMode: BillingMode.PROVISIONED,
      keySchema: [
        {
          attributeName: "id",
          keyType: "HASH",
        },
      ],
      replicas: getRegions(environment).map((region: string) => ({
        contributorInsightsSpecification: {
          enabled: true,
        },
        deletionProtectionEnabled: isProduction,
        pointInTimeRecoverySpecification: {
          pointInTimeRecoveryEnabled: isProduction,
        },
        region,
        readProvisionedThroughputSettings: {
          readCapacityAutoScalingSettings: {
            maxCapacity: capacityMultiplier * readCapacity,
            minCapacity: readCapacity,
            seedCapacity: readCapacity,
            targetTrackingScalingPolicyConfiguration: {
              targetValue: Math.floor(readCapacity * autoScaleFactor),
            },
          },
          readCapacityUnits: 5,
        },
      })),
      streamSpecification: {
        streamViewType: StreamViewType.NEW_AND_OLD_IMAGES,
      },
      tableName: `${service}-foo`,
      writeProvisionedThroughputSettings: {
        writeCapacityAutoScalingSettings: {
          maxCapacity: capacityMultiplier * writeCapacity,
          minCapacity: writeCapacity,
          seedCapacity: writeCapacity,
          targetTrackingScalingPolicyConfiguration: {
            targetValue: Math.floor(writeCapacity * autoScaleFactor),
          },
        },
      },
    });

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Should Match Production Table Properties`, () => {
    template.hasResourceProperties("AWS::DynamoDB::GlobalTable", {
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      BillingMode: "PROVISIONED",
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      Replicas: Match.arrayWith([
        {
          ContributorInsightsSpecification: {
            Enabled: true,
          },
          DeletionProtectionEnabled: false,
          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: false,
          },
          ReadProvisionedThroughputSettings: {
            ReadCapacityAutoScalingSettings: {
              MaxCapacity: 4,
              MinCapacity: 2,
              SeedCapacity: 2,
              TargetTrackingScalingPolicyConfiguration: {
                TargetValue: 1,
              },
            },
            ReadCapacityUnits: 5,
          },
          Region: "us-west-2",
        },
      ]),
      SSESpecification: {
        SSEEnabled: true,
      },
      StreamSpecification: {
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
      TableName: `${service}-foo`,
      WriteProvisionedThroughputSettings: {
        WriteCapacityAutoScalingSettings: {
          MaxCapacity: 4,
          MinCapacity: 2,
        },
      },
    });
  });
});
