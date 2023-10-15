import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';

const serverlessConfiguration: AWS = {
  service: 'api',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-localstack',
  ],
  provider: {
    name: 'aws',
    stage: '${opt:stage, "local"}',
    region: '${opt:region, "us-west-2"}' as "us-west-2",
    runtime: 'nodejs18.x',
    versionFunctions: '${self:custom.versionFunctions.${self:provider.stage}, self:custom.versionFunctions.local}' as unknown as boolean,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      ENVIRONMENT: '${self:provider.stage}',
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
    tags: '${self:custom.tags.${self:provider.stage}, self:custom.tags.local}' as unknown as Record<string, string>,
  },
  // import the function via paths
  functions: { hello },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    tags: {
      local: {
        _custom_id_: 'local',
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
    versionFunctions: {
      local: false,
      development: true,
      test: true,
      staging: true,
      production: true,
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
