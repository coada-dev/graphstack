import { Duration, NestedStack, RemovalPolicy } from "aws-cdk-lib";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import {
  BillingMode,
  Operation,
  Table,
  TableProps,
} from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";

import { branch, environment, region } from "#helpers/configuration.ts";
import { isProd } from "#helpers/environment.ts";
import handleOutputs from "#helpers/outputs.ts";

export default class DynamoStack extends NestedStack {
  private isProduction: boolean = isProd(environment);

  public readonly table: Table;

  constructor(scope: Construct, tableProps: TableProps) {
    super(scope, branch, tableProps);

    this.table = new Table(this, `${branch}-${tableProps.tableName}`, tableProps);

    if (tableProps.billingMode === BillingMode.PROVISIONED) {
      this.autoScaling(tableProps);
      this.setThrottleAlarm();
    }

    this.removalPolicy(tableProps);

    handleOutputs(
      this,
      {
        label: `${branch}-${tableProps.tableName}`,
        region,
        service: "ddb",
      },
      this.table.tableName,
    );
  }

  autoScaling(tableProps: TableProps) {
    const multiplier = this.isProduction ? 10 : 2;
    const readCapacity = tableProps.readCapacity || 5;
    const writeCapacity = tableProps.writeCapacity || 5;

    const readScaling = this.table.autoScaleReadCapacity({
      minCapacity: readCapacity,
      maxCapacity: readCapacity * multiplier,
    });
    readScaling.scaleOnUtilization({
      targetUtilizationPercent: this.isProduction ? 65 : 90,
    });

    const writeScaling = this.table.autoScaleWriteCapacity({
      minCapacity: writeCapacity,
      maxCapacity: writeCapacity * multiplier,
    });
    writeScaling.scaleOnUtilization({
      targetUtilizationPercent: this.isProduction ? 65 : 90,
    });
  }

  removalPolicy(tableProps: TableProps) {
    if (tableProps.deletionProtection) {
      this.table.applyRemovalPolicy(RemovalPolicy.RETAIN);
    }
  }

  setThrottleAlarm() {
    return new Alarm(this, `${branch}-throttleAlarmMetric`, {
      metric: this.table.metricThrottledRequestsForOperations({
        operations: [Operation.PUT_ITEM],
        period: Duration.minutes(1),
      }),
      evaluationPeriods: 1,
      threshold: 1,
    });
  }
}
