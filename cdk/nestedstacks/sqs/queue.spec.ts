import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { Queue } from "aws-cdk-lib/aws-sqs";

import { branch } from "#helpers/configuration.ts";
import SQSStack from "#nestedstacks/sqs/queue.ts";

const service = "sqsQueue";

describe(`${service} sqs standard queue`, () => {
  let stack: Stack;
  let template: Template;
  let queue: Queue;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const q = new SQSStack(wrapper, branch, {});
    stack = q;
    queue = q.queue;

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  test(`${service} no options`, () => {
    template.hasResource("AWS::SQS::Queue", {
      DeletionPolicy: "Delete",
      UpdateReplacePolicy: "Delete",
    });
  });

  it(`${service} Substack validation`, () => {
    expect(queue.node.id).toEqual(`${branch}-queue`);
  });
});

describe(`${service} sqs fifo queue`, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    stack = new SQSStack(wrapper, "bar", {
      contentBasedDeduplication: true,
      fifo: true,
    });

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  test(`${service} standard create with no options`, () => {
    template.hasResource("AWS::SQS::Queue", {
      Properties: {
        ContentBasedDeduplication: true,
        FifoQueue: true,
      },
      DeletionPolicy: "Delete",
      UpdateReplacePolicy: "Delete",
    });
  });
});
