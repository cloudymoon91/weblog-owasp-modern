const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
	username: 'api',
	key: '5b2e77a4662c95e1304f2f3f13eb897d-8c90f339-c6389887',
});
mg.messages
	.create(sandboxba884aeca8ee4d89ae1c111d99326ffd.mailgun.org, {
		from: "Mailgun Sandbox <postmaster@sandboxba884aeca8ee4d89ae1c111d99326ffd.mailgun.org>",
		to: ["arash.lebronjames@gmail.com"],
		subject: "Hello",
		text: "Testing some Mailgun awesomness!",
	})
	.then(msg => console.log(msg)) // logs response data
	.catch(err => console.log(err)); // logs any error`;


// You can see a record of this email in your logs: https://app.mailgun.com/app/logs.

// You can send up to 300 emails/day from this sandbox server.
// Next, you should add your own domain so you can send 10000 emails/month for free.