
const getQueryParams = event => event.queryStringParameters || {};
const greetName = name => `Hello, ${name}!`

exports.handler = async event => {
    const { name = "User" } = getQueryParams(event);

    return {
        statusCode: 200,
        body: greetName(name),
    };
};
