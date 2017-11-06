const AuthService = require('../services/auth');
const EmailService = require('../services/email');
const HttpResponse = require('../services/http-response');


const issueToken = (req, res) => {
	const {email} = req.body;
	const httpResponse = new HttpResponse();

	AuthService.issue(email)
	.then((token) => {
		const authMail  = EmailService.create();
		authMail.source = 'no-reply@oneprice.co.kr';
		authMail.to = email;
		authMail.subject = '자동 회신: [RobinCloud] Open API 인증 토큰';
		authMail.bodyText =
`
	RobinCloud Open API 인증이 활성화되었습니다.
			
	아래 발급된 token 값을 Open API 호출 시 x-access-token 헤더나 access_token 쿼리에 설정 해주시기 바랍니다.
	이 token은 최대 30일 간 유효하며, 30일 경과 후 재발급 받으시기 바랍니다.
			
	${token}
`;
		return authMail.send();
	})
	.then((data) => {
		httpResponse.setData(data);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};


module.exports = {
	issueToken
};

