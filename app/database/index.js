const AWS = require('aws-sdk');
const config = require('../config');


class Database {
    constructor() {
        // Open connection with DynamoDB
        AWS.config.update({
            region: "ap-northeast-2",
            accessKeyId: config['accessKeyId'],
            secretAccessKey: config['secretAccessKey']
        });

        this._dynamodb = new AWS.DynamoDB();
        this._docClient = new AWS.DynamoDB.DocumentClient();
    }

    get dynamodb()  { return this._dynamodb; }
    get docClient() { return this._docClient; }
}


module.exports = new Database();
