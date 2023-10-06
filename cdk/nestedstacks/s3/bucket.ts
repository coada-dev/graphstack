import { NestedStack } from "aws-cdk-lib";
import { Bucket, BucketProps } from "aws-cdk-lib/aws-s3";

import { Construct } from "constructs";

export default class S3Stack extends NestedStack {
  public readonly bucket: Bucket;

  constructor(scope: Construct, namespace: string, bucketProps: BucketProps) {
    super(scope, `${namespace}-bucket`, bucketProps);

    this.bucket = new Bucket(this, `${namespace}-bucket`, bucketProps);
  }
}
