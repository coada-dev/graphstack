import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";

import { branch, environment } from "#helpers/configuration.ts";
import { Environment } from "#helpers/environment.ts";
import { getRegions } from "#helpers/region.ts";
import DynamoStack from "./table";

const service = "dynamodb";
const replicationRegions = getRegions(environment);

describe(service, () => {
  let stack: Stack;
  let table: Table;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const t = new DynamoStack(wrapper, {
      billingMode: BillingMode.PROVISIONED,
      deletionProtection: true,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      replicationRegions,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    stack = t;
    table = t.table;

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Table Properties`, () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      DeletionProtectionEnabled: true,
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
      StreamSpecification: {
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
    });
  });

  it(`${service} Table Replace and Deletion Properties`, () => {
    template.hasResource("AWS::DynamoDB::Table", {
      DeletionPolicy: "Retain",
      UpdateReplacePolicy: "Retain",
    });
  });

  it(`${service} Table Replicas Required for Streaming`, () => {
    template.resourceCountIs(
      "Custom::DynamoDBReplica",
      replicationRegions.length,
    );

    replicationRegions.forEach((replica) => {
      template.hasResourceProperties("Custom::DynamoDBReplica", {
        Region: replica,
      });
    });
  });

  it(`${service} CloudWatch Properties`, () => {
    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      ComparisonOperator: "GreaterThanOrEqualToThreshold",
      EvaluationPeriods: 1,
      Metrics: Match.arrayWith([
        Match.objectLike({
          Expression: "putitem",
        }),
      ]),
      Threshold: 1,
    });
  });

  it(`${service} ASG Properties`, () => {
    template.hasResourceProperties(
      "AWS::ApplicationAutoScaling::ScalableTarget",
      {
        MaxCapacity: 10,
        ScalableDimension: "dynamodb:table:ReadCapacityUnits",
      },
    );

    template.hasResourceProperties(
      "AWS::ApplicationAutoScaling::ScalableTarget",
      {
        MaxCapacity: 10,
        ScalableDimension: "dynamodb:table:WriteCapacityUnits",
      },
    );
  });

  it(`${service} Substack validation`, () => {
    expect(table.node.id).toEqual(`${branch}-table`);
  });
});

describe(`${service} production unit test case`, () => {
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    process.env.CDK_ENVIRONMENT = Environment.production;
    const app = new App();
    const wrapper = new Stack(app);

    stack = new DynamoStack(wrapper, {
      billingMode: BillingMode.PROVISIONED,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    template = Template.fromStack(stack);
    // console.log(template, 'template');
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} Table Properties`, () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });
  });

  it(`${service} ASG Properties`, () => {
    template.hasResourceProperties(
      "AWS::ApplicationAutoScaling::ScalableTarget",
      {
        MaxCapacity: 10,
        ScalableDimension: "dynamodb:table:ReadCapacityUnits",
      },
    );

    template.hasResourceProperties(
      "AWS::ApplicationAutoScaling::ScalableTarget",
      {
        MaxCapacity: 10,
        ScalableDimension: "dynamodb:table:WriteCapacityUnits",
      },
    );
  });
});
