import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'serverless',
  frameworkVersion: '3',
  plugins: ['serverless-plugin-typescript', 'serverless-dynamodb-local', 'serverless-offline'],

  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: "us-east-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb:*"],
        Resource: ["*"]
      }
    ]
  },

  functions: { 
    hello: {
      handler: "src/functions/GenerateCertificate.handler",
      events: [
        {
          http: {
            path: "generate-certificate",
            method: "post",
            cors: true
          }
        }
      ]
    }
  },

  package: { individually: true },

  custom: {
    dynamodb: {
      stages: ["local", "dev"],
      start: {
        docker: true,
        port: 8000,
        inMemory: true,
        migrate: true
      }
    }
  },

  resources: {
    Resources: {
      dbCertificates: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "users_certificate",
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          },
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ]
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
