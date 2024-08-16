const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.table_name;


const getParams = (itemKey, oldValue, newValue) => {
    const createdAt = new Date();
    return {
		TableName: tableName,
		Item: {
			id: uuidv4(),
            modificationTime: createdAt.toISOString(),
            itemKey,
            updatedAttribute: "value",
            oldValue,
            newValue
		}
	};
	
}

exports.handler = async (event) => {
    // TODO implement
    console.log(JSON.stringify(event))
    const record = event.Records[0];
    if (record.eventName !== "MODIFY") return;
    
    const oldItem = record.dynamodb.OldImage;
    const newItem = record.dynamodb.NewImage;
    const oldValue = parseInt(oldItem.value.N);
    const newValue = parseInt(newItem.value.N);
    const itemKey = oldItem.key.S;
    
    
    const params = getParams(itemKey, oldValue, newValue);
    try {
		await docClient.put(params).promise();
		return true;
	} catch (err) {
        const parsedError = JSON.stringify(err, null, 2);
        console.error(parsedError)
		return parsedError;
	}
};
