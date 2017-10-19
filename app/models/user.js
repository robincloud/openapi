const DB = require('../database');
const AbstractModel = require('./AbstractModel');

class User extends AbstractModel {
	static initialize() {
        User.tableName = 'users';

		// Create table if not exists
		const params = {
			TableName: User.tableName
		};
		return DB.dynamodb.describeTable(params).promise()
		.catch((err) => {
			if (err.code !== 'ResourceNotFoundException') {
				throw err;
			}

			const tableDescription = {
				TableName: User.tableName,
				AttributeDefinitions: [
					{
						AttributeName: 'email',
						AttributeType: 'S'
					}
				],
				KeySchema: [
					{
						AttributeName: 'email',
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

	static findByEmail(email) {
		const params = {
			TableName: User.tableName,
			Key: {
				email
			}
		};

		return DB.docClient.get(params).promise()
		.then((data) => {
			if (!data['Item']) return null;

			const {email, passphrase, admin} = data['Item'];
			return new User(email, passphrase, admin);
		});
	}

	static create(email, passphrase) {
		if (!email) {
			throw new Error('Email address is empty.');
		}
		if (!User._isValidEmailAddress(email)) {
			throw new Error(`Email address (${email}) is invalid.`);
		}
		if (!passphrase) {
			throw new Error(`Passphrase is empty.`);
		}

		return User.findByEmail(email)
		.then((user) => {
			if (user) {
				throw new Error(`Given email address (${email}) already exists.`);
			}

			return new User(email, passphrase).save();
		});
	}

	static remove(email) {
		if (!email) {
			throw new Error(`Email address is empty.`);
		}

		return User.findByEmail(email)
		.then((user) => {
			if (!user) {
				throw new Error(`Given email address (${email}) does not exist.`);
			}

			const params = {
				TableName: User.tableName,
				Key: {
					email
				}
			};
			return DB.docClient.delete(params).promise();
		});
	}


	constructor(email, passphrase, admin = false) {
		super();
		this._object = {
			email,
			passphrase,
			admin
		};
	}

	save() {
		const params = {
			TableName: User.tableName,
			Item: this._object
		};

		return DB.docClient.put(params).promise()
		.then(() => this);
	}

	static _isValidEmailAddress(email) {
		const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return emailRegex.test(email);
	}


	// FOR TEST
	static test() {
		const email = 'mankiplayer@hotmail.com';
		const pass = 'aksrldi09a';

		return User.initialize()
		.then(() => User.create(email, pass))
		.then((user) => {
			console.log('User created.');
			console.log(user);
			return User.findByEmail(email);
		})
		.then((user) => {
			if (user) console.log('User found.');
			console.log(user);

			return User.remove(email);
		})
		.then(() => {
			console.log('PASSED.');
		})
		.catch((err) => {
			console.error(err);
		});
	}
}


module.exports = User;

User.test();
