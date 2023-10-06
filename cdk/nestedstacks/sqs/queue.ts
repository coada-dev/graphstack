import { NestedStack } from "aws-cdk-lib";
import { Queue, QueueProps } from "aws-cdk-lib/aws-sqs";

import { Construct } from "constructs";

export default class SQSStack extends NestedStack {
  public readonly arn: string;

  public readonly queue: Queue;

  public readonly url: string;

  constructor(scope: Construct, namespace: string, sqsProps?: QueueProps) {
    super(scope, `${namespace}-queue`, sqsProps);

    this.queue = new Queue(this, `${namespace}-queue`, sqsProps);
  }
}
