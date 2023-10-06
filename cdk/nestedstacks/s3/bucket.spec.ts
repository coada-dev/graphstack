import { App, Duration, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { Key } from "aws-cdk-lib/aws-kms";

import { Bucket, BucketEncryption, StorageClass } from "aws-cdk-lib/aws-s3";

import { branch } from "#helpers/configuration.ts";
import S3Stack from "#nestedstacks/s3/bucket.ts";

const service = "createStorageBucket";

describe(`${service} default encryption`, () => {
  let stack: Stack;
  let template: Template;
  let bucket: Bucket;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const b = new S3Stack(wrapper, branch, {});

    stack = b;
    bucket = b.bucket;
    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} standard properties`, () => {
    template.hasResource("AWS::S3::Bucket", {
      DeletionPolicy: "Retain",
      UpdateReplacePolicy: "Retain",
    });
  });

  it(`${service} Substack validation`, () => {
    expect(bucket.node.id).toEqual(`${branch}-bucket`);
  });
});

describe(`${service} bucket storage transitions`, () => {
  // TODO: transition properties not debuggable
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const stack = new S3Stack(wrapper, "bar", {
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: Duration.days(1),
          expiration: Duration.days(365),
          transitions: [
            {
              storageClass: StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(30),
            },
            {
              storageClass: StorageClass.INTELLIGENT_TIERING,
              transitionAfter: Duration.days(60),
            },
            {
              storageClass: StorageClass.GLACIER,
              transitionAfter: Duration.days(90),
            },
            {
              storageClass: StorageClass.DEEP_ARCHIVE,
              transitionAfter: Duration.days(180),
            },
          ],
        },
      ],
    });

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} transitions`, () => {
    template.hasResource("AWS::S3::Bucket", {
      DeletionPolicy: "Retain",
      UpdateReplacePolicy: "Retain",
    });
  });
});

describe(`${service} kms encryption`, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    stack = new S3Stack(wrapper, "baz", {
      encryption: BucketEncryption.KMS,
      encryptionKey: new Key(wrapper, "foo"),
    });

    template = Template.fromStack(stack);
    // console.log(template, 'template'); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${service} encrypted properties`, () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketEncryption: Match.objectLike({
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: "aws:kms",
            },
          },
        ],
      }),
    });
  });
});
