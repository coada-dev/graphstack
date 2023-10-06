import { Duration, NestedStack, RemovalPolicy } from "aws-cdk-lib";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import {
  BillingMode,
  Operation,
  Table,
  TableProps,
} from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";

import { branch, environment } from "#helpers/configuration.ts";
import { Environment } from "#helpers/environment.ts";

/* istanbul ignore next */
export default class DynamoStack extends NestedStack {
  private isProduction: boolean =
    Environment[environment as keyof typeof Environment] ===
    Environment.production;

  public readonly table: Table;

  constructor(scope: Construct, tableProps: TableProps) {
    super(scope, branch, {});

    this.table = new Table(this, `${branch}-table`, tableProps);

    if (tableProps.billingMode === BillingMode.PROVISIONED) {
      this.autoScaling(tableProps);
      this.setThrottleAlarm();
    }

    this.removalPolicy(tableProps);
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
