import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import { environment } from "#helpers/configuration.ts";
import { isProd } from "#helpers/environment.ts";
import DynamoStack from "#nestedstacks/ddb/table.ts";

export default class DynamoDBDistributionStack extends Stack {
  private isProduction: boolean = isProd(environment);

  constructor(scope: Construct, logicalID: string, props: StackProps) {
    super(scope, logicalID, props);

    new DynamoStack(this, {
      billingMode: BillingMode.PROVISIONED,
      deletionProtection: this.isProduction,
      encryption: TableEncryption.AWS_MANAGED,
      partitionKey: { name: "id", type: AttributeType.STRING },
      pointInTimeRecovery: this.isProduction,
      removalPolicy: this.isProduction
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      tableName: "users",
    });
  }
}
