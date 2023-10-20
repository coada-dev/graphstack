import * as dynamoose from "dynamoose";

const dynamoDataSource = (local = false) => {
  if (local) {
    const host = process.env.LOCALSTACK_HOSTNAME || "http://localhost";
    const port = process.env.DYNAMODB_PORT || "4566";

    return dynamoose.aws.ddb.local(`${host}:${port}`);
  }

  const ddb = new dynamoose.aws.ddb.DynamoDB({});
  return dynamoose.aws.ddb.set(ddb);
};

export default dynamoDataSource;