const AWS = require('aws-sdk');
const config = require('../config');


class Email {
	static create() {
		return new Email();
	}

	constructor() {
		this.params = {
			Source: '',
			ReplyToAddresses: [],
			Destination: {
				ToAddresses: [],
				CcAddresses: [],
				BccAddresses: []
			},
			Message: {
				Subject: {
					Data: '',
					Charset: 'UTF-8'
				},
				Body: {
					Text: {
						Data: '',
						Charset: 'UTF-8'
					},
					Html: {
						Data: '',
						Charset: 'UTF-8'
					}
				}
			}
		};
	}

	get source()            { return this.params.Source; }
	set source(address)     { this.params.Source = address; }
	get replyTo()           { return this.params.ReplyToAddresses; }
	set replyTo(addresses)  { this.params.ReplyToAddresses = Email.toArray(addresses); }
	get to()                { return this.params.Destination.ToAddresses; }
	set to(addresses)       { this.params.Destination.ToAddresses = Email.toArray(addresses); }
	get cc()                { return this.params.Destination.CcAddresses; }
	set cc(addresses)       { this.params.Destination.CcAddresses = Email.toArray(addresses); }
	get bcc()               { return this.params.Destination.BccAddresses; }
	set bcc(addresses)      { this.params.Destination.BccAddresses = Email.toArray(addresses); }
	get subject()           { return this.params.Message.Subject.Data; }
	set subject(data)       { this.params.Message.Subject.Data = data; }
	get bodyText()          { return this.params.Message.Body.Text.Data; }
	set bodyText(data)      { this.params.Message.Body.Text.Data = data; }
	get bodyHtml()          { return this.params.Message.Body.Html.Data; }
	set bodyHtml(data)      { this.params.Message.Body.Html.Data = data; }

	send() {
		const params = this.params;
		if (!params.Message.Body.Text.Data) delete params.Message.Body.Text;
		if (!params.Message.Body.Html.Data) delete params.Message.Body.Html;

		return Email.SES.sendEmail(params).promise();
	}


	static toArray(addresses) {
		return Array.isArray(addresses) ? addresses : new Array(addresses);
	}

	// FOR TEST
	static test() {
		const email = Email.create();

		email.source = 'no-reply@oneprice.co.kr';
		email.to = 'mankiplayer@oneprice.co.kr';
		email.cc = 'mankiplayer@hotmail.com';
		email.subject = 'E-mail test';
		email.bodyText = 'This is test email from robincloud API.';

		return email.send()
		.then(() => {
			console.log('PASSED.');
		})
		.catch(console.error);
	}
}

// AWS configuration for SES
AWS.config.update({
	region: 'us-east-1',
	accessKeyId: config['accessKeyId'],
	secretAccessKey: config['secretAccessKey']
});
Email.SES = new AWS.SES();


module.exports = Email;
