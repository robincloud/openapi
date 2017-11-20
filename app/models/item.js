const DB = require('../database');
const AbstractModel = require('./abstract-model');


class Item extends AbstractModel {
    constructor(data) {
        super();
        this._object = data;
    }

    save() {
        const params = {
            TableName: Item.tableName,
            Item: this._object
        };
        return DB.docClient.put(params).promise()
            .then(() => this);
    }

    //TODO: should be at abstract-model
    static batchWrite(malls) {
        const params = {
            "RequestItems": {
                [this.tableName]: []
            }
        };
        for (let i=0; i < malls.length; ++i) {
            params["RequestItems"][[this.tableName]].push(malls[i].getRequestParam());
        }

        console.log(JSON.stringify(params, null, 4));
        return DB.dynamodb.batchWriteItem(params).promise()
            .then(() => "success" );
    }

    remove() {
        if (!this.get('id')) {
            throw new Error(`id is empty.`);
        }
        const params = {
            TableName: Item.tableName,
            Key: {
                id: this.get('id')
            }
        };
        return DB.docClient.delete(params).promise();
    }

    static count() {
        const params = {
            TableName: Item.tableName
        };
        return DB.dynamodb.describeTable(params).promise()
            .then((data) => {
                return data['Table']['ItemCount']
            });
    }

    static initialize() {
        Item.tableName = 'items';

        // Create table if not exists
        const params = {
            TableName: Item.tableName
        };
        return DB.dynamodb.describeTable(params).promise()
            .catch((err) => {
                if (err.code !== 'ResourceNotFoundException') {
                    throw err;
                }

                const tableDescription = {
                    TableName: Item.tableName,
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

    // Limit = 0 means there is no limitation of number of items to evaluate.
	// However, DynamoDB limits maximum data set size to 1 MB. In this case the results are returned immediately.
    static scan(size = 0, projection = null, fromId = null) {
    	const params = {
    		TableName: Item.tableName,
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
    		        total_count: data['ScannedCount'],
    		    	count: data['Count'],
    		    	items: (data['Items'] || []).map((data) => new Item(data))
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
            TableName: Item.tableName,
            Key: {
                id
            }
        };
        console.log(params);

        return DB.docClient.get(params).promise()
            .then((data) => {
                if (!data['Item']) return null;
                return new Item(data['Item']);
            });
    }

    static create(data) {
        return Item.findById(data.id)
            .then((item) => {
                if (item) {
                    throw new Error(`Given id (${item.get('id')}) already exists.`);
                }
                return new Item(data).save();
            });
    }

    static remove(id) {
        if (!id) {
            throw new Error(`id is empty.`);
        }

        return Item.findById(id)
            .then((item) => {
                if (!item) {
                    throw new Error(`Given id (${id}) does not exist.`);
                }
                return item.remove();
            });
    }

    static getId(data) {
        const id = `${data.sid}_${data.pid}${(data.oid ? "_"+data.oid: "")}`;
        console.log(id);
        return id;
    }

    static test() {
        const data = {
            id: 'op_1111111',
            name: 'test_item_name'
        };

        const query = {
            mall_name: 'op',
            mall_id: '1111111',
        };

        return Item.initialize()
            .then(() => Item.create(data))
            .then((item) => {
                console.log('Item created');
                console.log(item);
                return Item.findById(Item.getId(query));
            },(err) => {
                console.log(err);
                return Item.findById(Item.getId(query));
            })
            .then((item) => {
                if (item) console.log('Item found');
                console.log(item);
                return Item.remove(item.get('id'));
            })
            .then(() => {
                console.log('PASSED(Item)');
            })
            .catch((err) => {
                console.error(err);
                throw err;
            })
    }
}


module.exports = Item;
