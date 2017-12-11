const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = process.env.AWS_BUCKET_NAME;

class UUIDGenerator {
    static generateFileNameForFile(filename) {
        const hexString = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, function () {
            const r = Math.random() * 16 | 0;

            return r.toString(16)
        });

        const fileNameInfo = filename.split(".");
        const fileExtension = fileNameInfo[fileNameInfo.length - 1];

        return hexString + "." + fileExtension;
    }
}

exports.handler = (event, context, callback) => {

    if (!event.hasOwnProperty('owner')) {
        context.fail({ err: 'Missing owner' })
    }

    if (!event.hasOwnProperty('contentType')) {
        context.fail({ err: 'Missing contentType' })
    }

    if (!event.hasOwnProperty('filePath')) {
        context.fail({ err: 'Missing filePath' })
    }

    const params = {
        Bucket: bucketName,
        Key: UUIDGenerator.generateFileNameForFile(event.filePath),
        Expires: 3600,
        ContentType: event.contentType,
        Metadata: {
            "filename": event.filePath,
            "owner": event.owner
        },
        Tagging: `tag=document`//&owner=${event.owner}
    };

    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
            context.fail({ err })
        } else {
            context.succeed({ url });
        }
    })
};