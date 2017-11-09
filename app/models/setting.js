const async = require('async');
const DB = require('../database');
const CustomError = require('../services/custom-error');
const AbstractModel = require('./abstract-model');


class Setting extends AbstractModel {
	static initialize() {
		Setting.tableName = 'settings';

		// Create table if not exists
		const params = {
			TableName: Setting.tableName
		};
		return DB.dynamodb.describeTable(params).promise()
		.catch((err) => {
			if (err.code !== 'ResourceNotFoundException') {
				throw err;
			}

			const tableDescription = {
				TableName: Setting.tableName,
				KeySchema: [
					{
						AttributeName: 'key',
						KeyType: 'HASH'
					}
				],
				AttributeDefinitions: [
					{
						AttributeName: 'key',
						AttributeType: 'S'
					}
				],
				ProvisionedThroughput: {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
				}
			};
			return DB.dynamodb.createTable(tableDescription).promise();
		});
	}

	static find(key) {
		const params = {
			TableName: Setting.tableName,
			Key: {
				key
			}
		};
		return DB.docClient.get(params).promise()
		.then((data) => {
			if (!data['Item']) return null;
			return new Setting(data);
		})
	}

	static remove(key) {
		if (!key) {
			throw new CustomError.InvalidArgument(`key is empty`);
		}

		return Setting.find(key)
		.then((value) => {
			if (!value) {
				throw new CustomError.ServerError(`Unable to find setting (${key})`);
			}

			const params = {
				TableName: Setting.tableName,
				Key: {
					key
				}
			};
			return DB.docClient.delete(params).promise();
		});
	}

	constructor(key, value) {
		super();
		this._object = {
			key,
			value
		};
	}

	save() {
		const params = {
			TableName: Setting.tableName,
			Item: this._object
		};

		return DB.docClient.put(params).promise()
		.then(() => this);
	}
}


module.exports = Setting;
