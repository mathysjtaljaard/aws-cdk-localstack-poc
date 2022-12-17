import { match } from "assert";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import {
  CFT_DYNAMODB_OUTPUT_EXPORT_TABLE_NAME_DESCRIPTION,
  CFT_DYNAMODB_OUTPUT_EXPORT_TABLE_ARN_DESCRIPTION,
  DynamoDBStack,
  TABLE_ID,
  TABLE_PARTITION_KEY_NAME,
  TABLE_SORT_KEY_NAME,
  CFT_DYNAMODB_OUTPUT_EXPORT_NAME,
  CFT_DYNAMODB_OUTPUT_ID_TABLE_NAME,
  CFT_DYNAMODB_OUTPUT_ID_TABLE_ARN,
  CFT_DYNAMODB_OUTPUT_EXPORT_ARN,
  CFT_MANAGED_POLICY_OUTPUT_ID_EXPORT_ARN,
  CFT_MANAGED_POLICY_OUTPUT_ID_EXPORT_NAME,
  CFT_MANAGED_POLICY_OUTPUT_EXPORT_ARN_DESCRIPTION,
  CFT_MANAGED_POLICY_OUTPUT_EXPORT_NAME,
  CFT_MANAGED_POLICY_OUTPUT_EXPORT_ARN,
  MANAGED_POLICY_READ_WRITE_ID,
} from "../lib/dynamodb-stack";

const DYNAMO_DB_RESOURCE_TYPE = "AWS::DynamoDB::Table";
const IAM_MANAGED_POLICY_RESOURCE_TYPE = "AWS::IAM::ManagedPolicy";

describe("DynamoDb Stack Tests", () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    template = Template.fromStack(new DynamoDBStack(app, "DynamoDbTestStack"));
  });

  describe("DynamoDB Tests", () => {
    test("should generate dynamodb table", () => {
      template.hasResource(DYNAMO_DB_RESOURCE_TYPE, {});
    });

    test("should have partition and sort key defined", () => {
      template.hasResourceProperties(DYNAMO_DB_RESOURCE_TYPE, {
        KeySchema: [
          Match.objectLike({
            AttributeName: TABLE_PARTITION_KEY_NAME,
            KeyType: "HASH",
          }),
          Match.objectLike({
            AttributeName: TABLE_SORT_KEY_NAME,
            KeyType: "RANGE",
          }),
        ],
        AttributeDefinitions: [
          Match.objectLike({
            AttributeName: TABLE_PARTITION_KEY_NAME,
            AttributeType: "S",
          }),
          Match.objectLike({
            AttributeName: TABLE_SORT_KEY_NAME,
            AttributeType: "S",
          }),
        ],
      });
    });

    test("should have output with table name", () => {
      template.hasOutput(CFT_DYNAMODB_OUTPUT_ID_TABLE_NAME, {
        Value: { Ref: Match.stringLikeRegexp(`${TABLE_ID}*`) },
        Description: CFT_DYNAMODB_OUTPUT_EXPORT_TABLE_NAME_DESCRIPTION,
        Export: Match.objectLike({
          Name: CFT_DYNAMODB_OUTPUT_EXPORT_NAME,
        }),
      });
    });

    test("should have output with table arn", () => {
      template.hasOutput(CFT_DYNAMODB_OUTPUT_ID_TABLE_ARN, {
        Value: {
          "Fn::GetAtt": [Match.stringLikeRegexp(`${TABLE_ID}*`), "Arn"],
        },
        Description: CFT_DYNAMODB_OUTPUT_EXPORT_TABLE_ARN_DESCRIPTION,
        Export: Match.objectLike({
          Name: CFT_DYNAMODB_OUTPUT_EXPORT_ARN,
        }),
      });
    });
  });

  describe("IAM Managed Policy Tests", () => {
    test("should have managed policy defined", () => {
      template.resourceCountIs(IAM_MANAGED_POLICY_RESOURCE_TYPE, 1);
    });

    test("should have read write access to table", () => {
      template.hasResourceProperties(IAM_MANAGED_POLICY_RESOURCE_TYPE, {
        PolicyDocument: {
          Statement: [
            {
              Action: Match.arrayWith([
                "dynamodb:BatchGetItem",
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:Query",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:BatchWriteItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
              ]),
              Effect: "Allow",
              Resource: {
                "Fn::GetAtt": [Match.stringLikeRegexp(`${TABLE_ID}*`), "Arn"],
              },
            },
          ],
        },
      });
    });

    test("should output managed policy arn", () => {
      template.hasOutput(CFT_MANAGED_POLICY_OUTPUT_ID_EXPORT_ARN, {
        Description: CFT_MANAGED_POLICY_OUTPUT_EXPORT_ARN_DESCRIPTION,
        Export: {
          Name: CFT_MANAGED_POLICY_OUTPUT_EXPORT_ARN,
        },
        Value: {
          Ref: Match.stringLikeRegexp(`${MANAGED_POLICY_READ_WRITE_ID}*`),
        },
      });
    });

    test("should output managed policy name", () => {
      template.hasOutput(CFT_MANAGED_POLICY_OUTPUT_ID_EXPORT_NAME, {});
    });
  });
});
