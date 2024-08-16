const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.table_name;


const getParams = (principalId, body) => {
    const createdAt = new Date();
    return {
		TableName: tableName,
		Item: {
			"id": uuidv4(),
			principalId,
            createdAt: createdAt.toISOString(),
			body
		}
	};
	
}

exports.handler = async (event) => {
    // TODO implement
    console.log(JSON.stringify(event))
    const params = getParams(event.principalId, event.content)
    try {
		await docClient.put(params).promise();
		return {
            statusCode: 201,
            event: params.Item
        };
	} catch (err) {
		return JSON.stringify(err, null, 2);
	}
};
