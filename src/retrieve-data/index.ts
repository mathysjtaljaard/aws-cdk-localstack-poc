import { DynamoDB } from "aws-sdk";

export const getData = async (params: any) => {
  // console.log("received params request for getData", params);
  const endpoint = `http://${process.env.LOCALSTACK_HOSTNAME}:4566`;
  console.log(process.env);
  console.log("endpoint", endpoint);
  try {
    const dynamoDbClient = new DynamoDB({
      endpoint: endpoint,
    });
    const results = await dynamoDbClient.scan({ TableName: "TestTable" });
    // console.log("dynamodb results", results);

    const putItemValues = {
      TableName: "TestTable",
      Item: {
        pk: { S: "something" },
        sk: { S: "somethingelse" },
        value1: { S: "value1" },
        value2: { S: "value2" },
      },
    };
    const res = await dynamoDbClient.putItem(putItemValues);
    // console.log('put results', res)
  } catch (ex) {
    console.log("error", ex);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ response: `Results for Table TestTable` }),
  };
};
