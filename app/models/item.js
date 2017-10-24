const DB = require('../database');
const AbstractModel = require('./AbstractModel');


class Item extends AbstractModel {
    constructor(oid,mall_name,id,pkey,name) {
        super();
        this._object = {
            oid,
            mall_name,
            id,
            pkey,
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
                            AttributeName: 'oid',
                            AttributeType: 'S'
                        }
                    ],
                    KeySchema: [
                        {
                            AttributeName: 'oid',
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
    static findById(oid) {
        const params = {
            TableName: Item.tableName,
            Key: {
                oid
            }
        };
        console.log(params);

        return DB.docClient.get(params).promise()
            .then((data) => {
                if (!data['Item']) return null;

                const {oid, mall_name, id, pkey, name} = data['Item'];
                return new Item(oid, mall_name, id, pkey, name);
            });
    }

    static create(data) {
        data.oid = Item.getOid(data);
        return Item.findById(data.oid)
            .then((item) => {
                if (item) {
                    throw new Error(`Given id (${item.get('oid')}) already exists.`);
                }
                return new Item(data.oid, data.mall_name, data.id, data.pkey, data.name).save();
            });
    }

    static remove(oid) {
        if (!oid) {
            throw new Error(`id is empty.`);
        }

        return Item.findById(oid)
            .then((item) => {
                if (!item) {
                    throw new Error(`Given id (${oid}) does not exist.`);
                }

                const params = {
                    TableName: Item.tableName,
                    Key: {
                        oid
                    }
                };
                return DB.docClient.delete(params).promise();
            });
    }

    static getOid(data) {
        const oid = data.mall_name + "_" + data.id + (data.pkey ? "_"+data.pkey : "");
        console.log(oid);
        return oid;
    }

    static test() {
        const data = {
            mall_name: 'op',
            id: '111111',
            name: 'test_item_name'
        };
        return Item.initialize()
            .then(() => Item.create(data))
            .then((item) => {
                console.log('Item created');
                console.log(item);
                return Item.findById(item.get('oid'));
            },(err) => {
                console.log(err);
                return Item.findById(Item.getOid(data));
            })
            .then((item) => {
                if (item) console.log('Item found');
                console.log(item);
                return Item.remove(item.get('oid'));
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
