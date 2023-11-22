import type { AWS } from '@serverless/typescript';

import { getBranch } from '@cdk/helpers/branch';
import graph from '@functions/graph';

const serverlessConfiguration: AWS = {
  service: `${getBranch()}-api-foo`,
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-localstack',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    stage: '${opt:stage, "local"}',
    region: '${opt:region, "us-west-2"}' as "us-west-2",
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_ENV: '${self:provider.stage}',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      REGION: '${self:provider.region}',
    },
    httpApi: {
      cors: true,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:BatchGet*',
              'dynamodb:BratchWrite*',
              'dynamodb:Delete*',
              'dynamodb:DescribeStream',
              'dynamodb:DescribeTable',
              'dynamodb:Get*',
              'dynamodb:List*',
              'dynamodb:Put*',
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:Update*',
            ],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: [
              'kms:decrypt',
            ],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: [
              'sns:Publish',
            ],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: [
              'sqs:GetQueueAttributes',
              'sqs:GetQueueUrl',
              'sqs:ListDeadLetterSourceQueues',
              'sqs:ListQueues',
              'sqs:ReceiveMessage',
              'sqs:SendMessage',
              'sqs:SendMessageBatch',
            ],
            Resource: {
              'Fn::Sub': 'arn:aws:sqs:${self:provider.region}:${AWS::AccountId}:*'
            },
          },
          {
            Effect: 'Allow',
            Action: [
              'ssm:DescribeParameters',
              'ssm:GetParameter',
              'ssm:GetParameters',
              'ssm:GetParametersByPath',
              'ssm:ListTagsForResource',
            ],
            Resource: {
              'Fn::Sub': 'arn:aws:ssm:*:${AWS::AccountId}:parameter/*'
            },
          },
          {
            Effect: 'Allow',
            Action: [
              'xray:PutTraceSegments',
              'xray:PutTelemetryRecords',
            ],
            Resource: '*',
          }
        ]
      }
    },
    logs: {
      httpApi: true,
    },
    logRetentionInDays: 60,
    tags: '${self:custom.tags.${self:provider.stage}}' as unknown as Record<string, string>,
  },
  functions: { graph },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      concurrency: 10,
      define: { 'require.resolve': undefined },
      exclude: ['aws-sdk'],
      loader: {
        ".graphql": "text",
      },
      minify: false,
      sourcemap: true,
      target: 'node18',
      platform: 'node',
    },
    localstack: {
      autostart: true,
      debug: true,
      lambda: {
        mountCode: true,
      },
      networks: ['ls'],
      stages: ['local'],
    },
    offline: {
      useChildProcesses: true,
    },
    "serverless-offline": {
      httpPort: 3011,
      lambdaPort: 3013,
      noPrependStageInUrl: true,
    },
    stage: '${self:provider.stage}',
    tags: {
      local: {
        _custom_id_: 'foo',
        provider: 'serverless',
      },
      development: {
        provider: 'serverless',
      },
      test: {
        provider: 'serverless',
      },
      staging: {
        provider: 'serverless',
      },
      production: {
        provider: 'serverless',
      },
    },
    tracing: {
      apiGateway: true,
      lambda: true,
    },
    vpc: {
      securityGroupIds: [
        '${ssm:/ec2/sg/apiGWSecurityGroupID}'
      ],
      subnetIds: [
        '{split(${ssm:/vpc/vpcPrivateSubnets}, ",")}'
      ]
    }
  },
};

module.exports = serverlessConfiguration;
