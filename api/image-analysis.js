const AWS = require("aws-sdk");

const rek = new AWS.Rekognition();

const getPathParams = event => event.pathParameters || {};

const detectLabels = params => new Promise((resolve, reject) => {
    rek.detectLabels(params, (err, data) => {
        if (err) return reject(new Error(err));
        return resolve(data.Labels);
    });
});

exports.handler = async event => {
    const bucket = process.env.BUCKET;

    const { image } = getPathParams(event);
    const rekParams = {
        Image: {
            S3Object: {
                Bucket: bucket,
                Name: image,
            },
        },
        MaxLabels: 10,
        MinConfidence: 50,
    };

    console.log(`Analyzing file: https://${bucket}.s3.amazonaws.com/${image}`);

    try {
        const labels = await detectLabels(rekParams);
        return {
            statusCode: 200,
            body: JSON.stringify({ labels }),
        };
    } catch (err) {
        return {
            statusCode: err.statusCode || 500,
            body: JSON.stringify({
                message: err.message || 'Internal Server Error',
            }),
        };
    }
};
