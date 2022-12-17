import * as cdk from "aws-cdk-lib";
import { CfnOutput, Fn, RemovalPolicy } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import {
  AttributeType,
  BillingMode,
  Table,
  TableClass,
  TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";
import {
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
} from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export const TABLE_ID = `DynamoDbTable`;
export const TABLE_NAME = `TestTable`;
export const TABLE_PARTITION_KEY_NAME = "pk";
export const TABLE_SORT_KEY_NAME = "sk";
export const CFT_DYNAMODB_OUTPUT_ID_TABLE_NAME = "dynamodbtablename";
export const CFT_DYNAMODB_OUTPUT_ID_TABLE_ARN = "dynamodbtablarn";
export const CFT_DYNAMODB_OUTPUT_EXPORT_NAME = "dynamodb-table-name";
export const CFT_DYNAMODB_OUTPUT_EXPORT_ARN = "dynamodb-table-arn";
export const CFT_DYNAMODB_OUTPUT_EXPORT_TABLE_NAME_DESCRIPTION =
  "Dynamo db table name exported to allow for use with other stacks";
export const CFT_DYNAMODB_OUTPUT_EXPORT_TABLE_ARN_DESCRIPTION =
  "Dynamo db table arn exported to allow for use with other stacks";

export const MANAGED_POLICY_READ_WRITE_ID = "dynamodbRWmanagedpolicyId";
export const MANAGED_POLICY_READ_WRITE_NAME = "tableNameAccessRWDynamoDb";
export const CFT_MANAGED_POLICY_OUTPUT_ID_EXPORT_NAME =
  "dynamoDbRWPolicyNameId";
export const CFT_MANAGED_POLICY_OUTPUT_EXPORT_NAME =
  "tableNameAccessRWDynamoDbName";
export const CFT_MANAGED_POLICY_OUTPUT_EXPORT_NAME_DESCRIPTION =
  "DynamoDb Managed Policy Name for Read and Write access to table";
export const CFT_MANAGED_POLICY_OUTPUT_ID_EXPORT_ARN = "dynamoDbRWPolicyArnId";
export const CFT_MANAGED_POLICY_OUTPUT_EXPORT_ARN =
  "tableNameAccessRWDynamoDbArn";
export const CFT_MANAGED_POLICY_OUTPUT_EXPORT_ARN_DESCRIPTION =
  "DynamoDb Managed Policy Arn for Read and Write access to table";

const READ_WRITE_ACCESS_ACTIONS = [
  "BatchGetItem",
  "GetRecords",
  "GetShardIterator",
  "Query",
  "GetItem",
  "Scan",
  "BatchWriteItem",
  "PutItem",
  "UpdateItem",
  "DeleteItem",
];

// need to parametrize the stack endpoint

export class DynamoDBStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, TABLE_ID, {
      partitionKey: {
        name: TABLE_PARTITION_KEY_NAME,
        type: AttributeType.STRING,
      },
      sortKey: { name: TABLE_SORT_KEY_NAME, type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: TABLE_NAME,
      tableClass: TableClass.STANDARD_INFREQUENT_ACCESS,
    });

    new CfnOutput(this, CFT_DYNAMODB_OUTPUT_ID_TABLE_NAME, {
      value: table.tableName,
      exportName: CFT_DYNAMODB_OUTPUT_EXPORT_NAME,
      description: CFT_DYNAMODB_OUTPUT_EXPORT_TABLE_NAME_DESCRIPTION,
    });

    new CfnOutput(this, CFT_DYNAMODB_OUTPUT_ID_TABLE_ARN, {
      value: table.tableArn,
      exportName: CFT_DYNAMODB_OUTPUT_EXPORT_ARN,
      description: CFT_DYNAMODB_OUTPUT_EXPORT_TABLE_ARN_DESCRIPTION,
    });

    // Generate the role
    const dynamoDbReadWriteAccessManagePolicy = new ManagedPolicy(
      this,
      MANAGED_POLICY_READ_WRITE_ID,
      {
        managedPolicyName: MANAGED_POLICY_READ_WRITE_NAME,
        document: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: [table.tableArn],
              actions: READ_WRITE_ACCESS_ACTIONS.map(
                (action) => `dynamodb:${action}`
              ),
            }),
          ],
        }),
      }
    );

    new CfnOutput(this, CFT_MANAGED_POLICY_OUTPUT_ID_EXPORT_NAME, {
      value: dynamoDbReadWriteAccessManagePolicy.managedPolicyName,
      exportName: CFT_MANAGED_POLICY_OUTPUT_EXPORT_NAME,
      description: CFT_MANAGED_POLICY_OUTPUT_EXPORT_NAME_DESCRIPTION,
    });

    new CfnOutput(this, CFT_MANAGED_POLICY_OUTPUT_ID_EXPORT_ARN, {
      value: dynamoDbReadWriteAccessManagePolicy.managedPolicyArn,
      exportName: CFT_MANAGED_POLICY_OUTPUT_EXPORT_ARN,
      description: CFT_MANAGED_POLICY_OUTPUT_EXPORT_ARN_DESCRIPTION,
    });

    // API Gateway
    const apiGateway = new RestApi(this, "restApi", {
      restApiName: "TestApiLambdaToDynamo",
      description:
        "This is an endpoint used for performing CRUD operations to the dynamodb table",
    });

    apiGateway.root.addMethod(
      "GET",
      new LambdaIntegration(
        new Function(this, "retrieveAllDataLambda", {
          runtime: Runtime.NODEJS_16_X, //LocalStack only handles <= v16 18 is not available `yet`
          code: Code.fromAsset("./src/retrieve-data/"),
          handler: "index.getData",
        }),
        {
          requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        }
      )
    );
  }
}
