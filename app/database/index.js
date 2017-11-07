const AWS = require('aws-sdk');


class Database {
    constructor() {
        this._dynamodb = new AWS.DynamoDB();
        this._docClient = new AWS.DynamoDB.DocumentClient();
    }

    get dynamodb()  { return this._dynamodb; }
    get docClient() { return this._docClient; }
}


module.exports = new Database();
