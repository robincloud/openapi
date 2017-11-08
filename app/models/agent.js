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
                            AttributeName: 'id',
                            AttributeType: 'S'
                        },
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
            TableName: Agent.tableName,
            Key: {
                id
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
        const id = data.uuid;
        const message = data.message;
        const cpu = data.cpu;
        return Agent.findById(id)
            .then((item) => {
                if (!item) {
                    throw new Error(`Given id does not exists.`);
                }
                const params = {
                    TableName: Agent.tableName,
                    Key: {
                        id
                    },
                    UpdateExpression: "set message = :m, cpu = :c",
                    ExpressionAttributeValues: {
                        ":m": message,
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
        return Agent.findById(data.id)
            .then((item) => {
                if (item) {
                    throw new Error(`Given id (${item.get('id')}) already exists.`);
                }
                return new Agent(data).save();
            });
    }


    static test() {
        const data = {
            id: 'asdf',
            name: 'test_Agent_name'
        };
        return Agent.initialize()
            .then(() => Agent.create(data))
            .then((item) => {
                console.log('Agent created');
                console.log(item);
                return Agent.findById(item.get('id'));
            }, (err) => {
                console.log(err);
                return Agent.findById(data.id);
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
