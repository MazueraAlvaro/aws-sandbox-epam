const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const userPoolId = process.env.CUPId;
const clientId = process.env.CUPClientId;

const cognito = new AWS.CognitoIdentityServiceProvider();
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // TODO implement
  console.log(JSON.stringify(event));
  const body = JSON.parse(event.body);

  if (event.path === "/signup" && event.httpMethod === "POST") {
    return handleSignUp(body.email, body.password);
  }

  if (event.path === "/signin" && event.httpMethod === "POST") {
    return handleSignIn(body.email, body.password);
  }

  if (event.resource === "/tables" && event.httpMethod === "GET") {
    return handleTableList();
  }

  if (event.resource === "/tables" && event.httpMethod === "POST") {
    return handleTableCreate(body);
  }

  if (event.resource === "/tables/{tableId}" && event.httpMethod === "GET") {
    return handleTableById(event.pathParameters.tableId);
  }

  if (event.path === "/reservations" && event.httpMethod === "POST") {
    return handleReservationCreate(body);
  }

  if (event.path === "/reservations" && event.httpMethod === "GET") {
    return handleReservationList(body);
  }
};

const handleReservationCreate = async ({
  tableNumber,
  clientName,
  phoneNumber,
  date,
  slotTimeStart,
  slotTimeEnd,
}) => {
  const reservationId = uuidv4();
  const params = {
    TableName: process.env.reservations_table,
    Item: {
      id: reservationId,
      tableNumber,
      clientName,
      phoneNumber,
      date,
      slotTimeStart,
      slotTimeEnd,
    },
  };
  try {
    await docClient.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ reservationId }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: err.message }),
    };
  }
};

const handleTableCreate = async ({ id, number, places, isVip, minOrder }) => {
  const params = {
    TableName: process.env.tables_table,
    Item: {
      id,
      number,
      places,
      isVip,
      minOrder,
    },
  };
  try {
    await docClient.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ id }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: err.message }),
    };
  }
};

const handleTableList = async (tableId) => {
  const params = {
    TableName: process.env.tables_table,
  };

  try {
    const data = await docClient.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ tables: data.Items }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

const handleTableById = async (tableId) => {
  if (!tableId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing id parameter" }),
    };
  }

  const params = {
    TableName: process.env.tables_table,
    KeyConditionExpression: "#id = :idValue",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":idValue": parseInt(tableId),
    },
  };

  try {
    const data = await docClient.query(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ tables: data.Items[0] }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

const handleReservationList = async () => {
  const params = {
    TableName: process.env.reservations_table,
  };

  try {
    const data = await docClient.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ reservations: data.Items }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

const handleSignUp = async (email, password) => {
  const params = {
    UserPoolId: userPoolId,
    Username: email,
    TemporaryPassword: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };

  try {
    await cognito.adminCreateUser(params).promise();
    await handleConfirmSignUp(email, password);
    return {
      statusCode: 200,
      body: "Sign-up process is successful",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

const handleConfirmSignUp = async (email, password) => {
  const signinResponse = await cognitoSignIn(email, password);
  console.log(JSON.stringify({ signinResponse }));
  return await cognito
    .adminRespondToAuthChallenge({
      UserPoolId: userPoolId,
      ClientId: clientId,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: signinResponse.Session,
      ChallengeResponses: {
        USERNAME: email,
        PASSWORD: password,
        NEW_PASSWORD: password,
      },
    })
    .promise();
};

const handleSignIn = async (email, password) => {
  try {
    const response = await cognitoSignIn(email, password);
    console.log(JSON.stringify(response));
    return {
      statusCode: 200,
      body: JSON.stringify({
        accessToken: response.AuthenticationResult.IdToken,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

const cognitoSignIn = async (email, password) => {
  const params = {
    AuthFlow: "ADMIN_NO_SRP_AUTH",

    ClientId: clientId,
    UserPoolId: userPoolId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };
  return await cognito.adminInitiateAuth(params).promise();
};
