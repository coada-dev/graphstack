/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NestedStack, RemovalPolicy } from "aws-cdk-lib";
import {
  CfnGlobalTable as Table,
  CfnGlobalTableProps,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

import { branch, environment } from "#helpers/configuration.ts";
import { Environment } from "#helpers/environment.ts";

export default class CfnGlobalTableStack extends NestedStack {
  protected readonly removalPolicy: RemovalPolicy =
    environment === Environment.production
      ? RemovalPolicy.RETAIN
      : RemovalPolicy.DESTROY;

  public readonly table: Table;

  constructor(
    scope: Construct,
    tableProps: CfnGlobalTableProps,
  ) {
    super(scope, branch, {});

    if (!tableProps.tableName) {
      throw new Error("Property tableName is required");
    } else {
      this.table = this.createTable(tableProps);
      this.table.applyRemovalPolicy(this.removalPolicy);
    }
  }

  createTable(props: CfnGlobalTableProps) {
    const globalSecondaryIndexes =
      (props.globalSecondaryIndexes as Table.GlobalSecondaryIndexProperty[]) ||
      [];
    const replicas =
      (props.replicas as Table.ReplicaSpecificationProperty[]) || [];

    return new Table(this, props.tableName!, {
      ...props,
      ...(globalSecondaryIndexes.length && {
        replicas: replicas.map(
          (replica: Table.ReplicaSpecificationProperty) => ({
            ...replica,
            globalSecondaryIndexes: globalSecondaryIndexes.map(
              (gsi: Table.GlobalSecondaryIndexProperty) => ({
                contributorInsightsSpecification: {
                  enabled: true,
                },
                indexName: gsi.indexName,
                readProvisionedThroughputSettings:
                  replica.readProvisionedThroughputSettings,
              }),
            ),
          }),
        ),
      }),
      sseSpecification: {
        sseEnabled: true,
      },
    });
  }
}
