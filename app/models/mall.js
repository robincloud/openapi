const DB = require('../database');
const AbstractModel = require('./abstract-model');


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

    //TODO: should be at abstract-model
    static batchWrite(malls) {
        if (malls.length === 0 ) {
            return Promise.resolve()
        }
        let params = {
            "RequestItems": {
                [this.tableName]: []
            }
        };
        for (let i=0; i < malls.length; i++) {
            params["RequestItems"][[this.tableName]].push(malls[i].getRequestParam());
            if (i % 24 === 0 && i !== 0) {
                DB.dynamodb.batchWriteItem(params, function (err) {
                    if (err) console.error(err, err.stack);
                });
                params["RequestItems"][[this.tableName]].length = 0;
            }
        }
        return DB.dynamodb.batchWriteItem(params).promise()
            .then(() => "success" );
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

    static count() {
        const params = {
            TableName: Mall.tableName
        };
        return DB.dynamodb.describeTable(params).promise()
            .then((data) => {
                return data['Table']['ItemCount']
            });
    }

    // Limit = 0 means there is no limitation of number of items to evaluate.
    // However, DynamoDB limits maximum data set size to 1 MB. In this case the results are returned immediately.
    static scan(size = 0, projection = null, fromId = null) {
        const params = {
            TableName: Mall.tableName,
        };
        if (size) {
            params['Limit'] = size;
        }
        if (projection) {
            if (Array.isArray(projection)) projection = projection.join(',');
            params['ProjectionExpression'] = projection;
        }
        if (fromId) {
            params['ExclusiveStartKey'] = fromId;
        }

        return DB.docClient.scan(params).promise()
            .then((data) => {
                const result = {
                    count: data['Count'],
                    malls: (data['Items'] || []).map((data) => new Mall(data))
                };
                if ('LastEvaluatedKey' in data) {
                    result['final'] = false;
                    result['nextId'] = data['LastEvaluatedKey'];
                } else {
                    result['final'] = true;
                }

                return result;
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

    static findByIds(ids) {
        const tables = {};
        tables[Mall.tableName] = {
            Keys: ids.map((i) => { return {id:i}} )
        };
        const params = {
            RequestItems: tables
        };

        return DB.docClient.batchGet(params).promise()
            .then((data) => {
                const res = data['Responses']['malls'];
                const result = {
                    count: res.length,
                    malls: (res || []).map((data) => new Mall(data))
                };
                return result;
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
