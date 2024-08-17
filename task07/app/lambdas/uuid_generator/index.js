const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const Readable = require('stream').Readable

const s3 = new AWS.S3();

const getFileContent = () => {
    return {
        ids: [...Array(10)].map(() => uuidv4())
    }
}

const getRedableStream = () => {
    const data = getFileContent();
    return Readable.from([JSON.stringify(data)]);
}

exports.handler = async (event) => {
    // TODO implement
    console.log(JSON.stringify(event))
    const time =  new Date(event.time);
    const params = {
        Bucket: process.env.target_bucket,
        Key: time.toISOString(),
        Body: getRedableStream()
    };

    try {
        await s3.upload(params).promise();
    }
    catch(e){
        console.log(e);
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
