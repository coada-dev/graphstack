import { NestedStack, RemovalPolicy, StackProps } from "aws-cdk-lib";
import { Distribution, DistributionProps } from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess, BucketEncryption } from "aws-cdk-lib/aws-s3";

import { Environment } from "#helpers/environment.ts";
import { branch, environment } from "#helpers/configuration.ts";
import S3Stack from "#nestedstacks/s3/bucket.ts";

export default class DistributionStack extends NestedStack {
  private isProduction: boolean =
    Environment[environment as keyof typeof Environment] ===
    Environment.production;

  createOrigin(): S3Stack {
    return new S3Stack(this, `${branch}-distribution-origin`, {
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: `${branch}-origin`,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      transferAcceleration: this.isProduction,
    });
  }

  createDistribution(distributionProps: DistributionProps): Distribution {
    return new Distribution(this, `${branch}-distribution`, distributionProps);
  }
}
