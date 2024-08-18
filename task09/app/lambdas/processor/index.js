const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const axios = require("axios");

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.table_name;

const getMeteo = () => {
  return axios
    .get(
      "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
    )
    .then((data) => data.data);
};

const getParams = ({
  elevation,
  generationtime_ms,
  hourly,
  hourly_units,
  latitude,
  longitude,
  timezone,
  timezone_abbreviation,
  utc_offset_seconds,
}) => {
  return {
    TableName: tableName,
    Item: {
      id: uuidv4(),
      forecast: {
        elevation,
        generationtime_ms,
        hourly,
        hourly_units,
        latitude,
        longitude,
        timezone,
        timezone_abbreviation,
        utc_offset_seconds,
      },
    },
  };
};

exports.handler = async (event) => {
  // TODO implement
  const meteo = await getMeteo();
  const params = getParams(meteo);

  try {
    await docClient.put(params).promise();
    return {
      statusCode: 201,
      event: params.Item,
    };
  } catch (err) {
    return JSON.stringify(err, null, 2);
  }
};
