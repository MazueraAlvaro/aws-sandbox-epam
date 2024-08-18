const { OpenMetoAPI } = require("/opt/nodejs");

exports.handler = async (event) => {
    // TODO implement
    const meteo = new OpenMetoAPI;
    const responseApi = await meteo.getMeteo()
    console.log(JSON.stringify(responseApi))
    const response = {
        statusCode: 200,
        body: responseApi,
    };
    return response;
};
