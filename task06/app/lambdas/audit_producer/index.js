const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.table_name;

const getParams = (itemKey, newValue, oldValue = undefined) => {
  const createdAt = new Date();
  return {
    TableName: tableName,
    Item: {
      id: uuidv4(),
      modificationTime: createdAt.toISOString(),
      itemKey,
      updatedAttribute: "value",
      ...(oldValue && { oldValue }),
      newValue,
    },
  };
};

exports.handler = async (event) => {
  // TODO implement
  console.log(JSON.stringify(event));
  const record = event.Records[0];
  if (!["MODIFY", "INSERT"].includes(record.eventName)) return;

  const oldItem = record.dynamodb.OldImage;
  const newItem = record.dynamodb.NewImage;
  const oldValue = parseInt(oldItem.value.N);
  const newValue = parseInt(newItem.value.N);
  const itemKey = newItem.key.S;

  let params = {};
  if (record.eventName === "MODIFY") {
    params = getParams(itemKey, newValue, oldValue);
  } else {
    params = getParams(itemKey, {
      key: itemKey,
      value: newValue,
    });
  }

  try {
    await docClient.put(params).promise();
    return true;
  } catch (err) {
    const parsedError = JSON.stringify(err, null, 2);
    console.error(parsedError);
    return parsedError;
  }
};
