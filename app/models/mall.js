const DB = require('../database');
const AbstractModel = require('./AbstractModel');


class Mall extends AbstractModel {
    constructor(data) {
        super();
        this._object = data;
    }

    save() {
        const params = {
            TableName: Mall.tableName,
            Item: this._object
        };

        return DB.docClient.put(params).promise()
            .then(() => this);

    }

    static initialize() {
        Mall.tableName = 'malls';

        // Create table if not exists
        const params = {
            TableName: Mall.tableName
        };
        return DB.dynamodb.describeTable(params).promise()
            .catch((err) => {
                if (err.code !== 'ResourceNotFoundException') {
                    throw err;
                }

                const tableDescription = {
                    TableName: Mall.tableName,
                    AttributeDefinitions: [
                        {
                            AttributeName: 'id',
                            AttributeType: 'S'
                        }
                    ],
                    KeySchema: [
                        {
                            AttributeName: 'id',
                            KeyType: 'HASH'
                        }
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 2
                    }
                };

                return DB.dynamodb.createTable(tableDescription).promise();
            });
    }
    static findById(id) {
        const params = {
            TableName: Mall.tableName,
            Key: {
                id
            }
        };

        return DB.docClient.get(params).promise()
            .then((data) => {
                if (!data['Item']) return null;
                return new Mall(data['Item']);
            });
    }

    static create(data) {
        return Mall.findById(data.id)
            .then((item) => {
                if (item) {
                    throw new Error(`Given id (${item.get('id')}) already exists.`);
                }
                return new Mall(data).save();
            });
    }

    static remove(id) {
        if (!id) {
            throw new Error(`id is empty.`);
        }

        return Mall.findById(id)
            .then((item) => {
                if (!item) {
                    throw new Error(`Given id (${id}) does not exist.`);
                }

                const params = {
                    TableName: Mall.tableName,
                    Key: {
                        id
                    }
                };
                return DB.docClient.delete(params).promise();
            });
    }

    static test() {
        const data = {
            id: 'op_111111',
            name: 'test_mall_name'
        };
        return Mall.initialize()
            .then(() => Mall.create(data))
            .then((item) => {
                console.log('Mall created');
                console.log(item);
                return Mall.findById(item.get('id'));
            }, (err) => {
                console.log(err);
                return Mall.findById(data.id);
            })
            .then((item) => {
                if (item) console.log('Mall found');
                console.log(item);
                return Mall.remove(item.get('id'));
            })
            .then(() => {
                console.log('PASSED(Mall)');
            })
            .catch((err) => {
                console.error(err);
                throw err;
            })
    }

}


module.exports = Mall;
