const DB = require('../database');
const AbstractModel = require('./AbstractModel');


class Item extends AbstractModel {
    constructor(id, name) {
        super();
        this._object = {
            id,
            name
        };
    }

    save() {
        const params = {
            TableName: Item.tableName,
            Item: this._object
        };
        return DB.docClient.put(params).promise()
            .then(() => this);
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
    static findById(id) {
        const params = {
            TableName: Item.tableName,
            Key: {
                id
            }
        };

        return DB.docClient.get(params).promise()
            .then((data) => {
                if (!data['Item']) return null;

                const {id, name} = data['Item'];
                return new Item(id, name);
            });
    }

    static create(data) {
        return Item.findById(data.id)
            .then((item) => {
                if (item) {
                    //throw new Error(`Given id (${item.get('id')}) already exists.`);

                }
                return new Item(data.id, data.name).save();
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

                const params = {
                    TableName: Item.tableName,
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
            name: 'test_item_name'
        };
        return Item.initialize()
            .then(() => Item.create(data))
            .then((item) => {
                console.log('Item created');
                console.log(item);
                return Item.findById(item.get('id'));
            },(err) => {
                console.log(err);
                return Item.findById(data.id);
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
Item.test().catch((err) => {});
