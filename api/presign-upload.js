const AWS = require("aws-sdk");
const crypto = require("crypto");

const s3 = new AWS.S3();

exports.handler = async (event) => {
    const bucket = process.env.BUCKET;

    const data = s3.createPresignedPost({
        Bucket: bucket,
        Conditions: [
            ["content-length-range", 	0, 10000000],
            ["starts-with", "$Content-Type", "image/"],
            {"acl": "public-read"}
        ],
        Fields: {
            key: crypto.randomBytes(8).toString('hex'),
        },
        Expires: 24 * 60 * 60
    });

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
};
