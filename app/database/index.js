const AWS = require('aws-sdk');
const config = require('../config');


class DB {
    static initialize() {
        // Open connection with DynamoDB
        if (!DB.dynamodb) {
            AWS.config.update({
                region: "ap-northeast-2",
                accessKeyId: config['accessKeyId'],
                secretAccessKey: config['secretAccessKey'],
                endpoint: config['endpoint']
            });

            DB.dynamodb = new AWS.DynamoDB();
            DB.docClient = new AWS.DynamoDB.DocumentClient();
        }
    }
}


module.exports = DB;
DB.initialize();
