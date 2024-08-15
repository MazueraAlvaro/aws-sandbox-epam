exports.handler = async (event) => {
  // TODO implement
  if (event.requestContext.http.path == "/hello") {
    return {
      statusCode: 200,
      body: {
        statusCode: 200,
        message: "Hello from Lambda",
      },
    };
  }
  return {
    statusCode: 200,
    body: {
      statusCode: 400,
      message: `Bad request syntax or unsupported method. Request path: ${event.requestContext.http.path}. HTTP method: ${event.requestContext.http.method}`,
    },
  };
};
