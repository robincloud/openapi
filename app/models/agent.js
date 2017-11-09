const DB = require('../database');
const AbstractModel = require('./abstract-model');


class Agent extends AbstractModel {
    constructor(data) {
        super();
        this._object = data;
    }

    save() {
        const params = {
            TableName: Agent.tableName,
            Item: this._object
        };

        // return DB.docClient.update(params).promise()
        return DB.docClient.put(params).promise()
            .then(() => this._object);
    }

    static initialize() {
        Agent.tableName = 'agents';

        // Create table if not exists
        const params = {
            TableName: Agent.tableName
        };
        return DB.dynamodb.describeTable(params).promise()
            .catch((err) => {
                if (err.code !== 'ResourceNotFoundException') {
                    throw err;
                }

                const tableDescription = {
                    TableName: Agent.tableName,
                    AttributeDefinitions: [
                        {
                            AttributeName: 'uuid',
                            AttributeType: 'S'
                        },
                    ],
                    KeySchema: [
                        {
                            AttributeName: 'uuid',
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

    static findById(uuid) {
        const params = {
            TableName: Agent.tableName,
            Key: {
                uuid
            }
        };
        return DB.docClient.get(params).promise()
            .then((data) => {
                if (!data['Item']) return null;
                return new Agent(data['Item']);
            });
    }

    static getAll() {
        const params = {
            TableName: Agent.tableName
        };
        return DB.docClient.scan(params).promise()
            .then((data) => {
                if (!data['Items']) return null;
                return new Agent(data['Items']);
            });
    }

    static Update(data) {
        const uuid = data.uuid;
        const msg = data.msg;
        const cpu = data.cpu;
        return Agent.findById(uuid)
            .then((item) => {
                if (!item) {
                    throw new Error(`Given id does not exists.`);
                }
                const params = {
                    TableName: Agent.tableName,
                    Key: {
                        uuid
                    },
                    UpdateExpression: "set msg = :m, cpu = :c",
                    ExpressionAttributeValues: {
                        ":m": msg,
                        ":c": cpu
                    },
                    ReturnValues: "UPDATED_NEW"
                };
                return DB.docClient.update(params).promise();
            }).then((data) => {
                return new Agent(data);
            });
    }

    static create(data) {
        return Agent.findById(data.uuid)
            .then((item) => {
                if (item) {
                    throw new Error(`Given id (${item.get('uuid')}) already exists.`);
                }
                return new Agent(data).save();
            });
    }


    static test() {
        const data = {
            uuid: 'asdf',
            name: 'test_Agent_name'
        };
        return Agent.initialize()
            .then(() => Agent.create(data))
            .then((item) => {
                console.log('Agent created');
                console.log(item);
                return Agent.findById(item.get('uuid'));
            }, (err) => {
                console.log(err);
                return Agent.findById(data.uuid);
            })
            .then((item) => {
                console.log('PASSED(Agent)');
                return item;
            })
            .catch((err) => {
                console.error(err);
                throw err;
            })
    }

}


module.exports = Agent;
