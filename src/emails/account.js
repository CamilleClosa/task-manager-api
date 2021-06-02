//this will contain all the codes for sending emails related to user accounts such as signing app or deleting account
const sgMail = require("@sendgrid/mail");

//const sendgripAPIKey = "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";
//setting environment variable for API key

//letting sendgrid use the API key
//sgMail.setApiKey(sendgripAPIKey);

//letting grid use the API key in environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/*
//Script that sends an email
//let send you an individual email
sgMail.send({
  to: "closacccc@gmail.com",
  from: "closacccc@gmail.com",
  subject: "This is my first email",
  text: "You are loved",
});
*/

//************Sending Welcome and Cancellation Emails
//Welcome email upon creating account

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "closacccc@gmail.com",
    subject: "Welcome to Task App",
    text: `Welcome to the app, ${name}! We are happy to serve you`,
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "closacccc@gmail.com",
    subject: "Cancellation Email",
    text: `Good day, ${name}! I hope your doing great. We have detect that you deleted your account. Please let us know why`,
  });
};
module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
