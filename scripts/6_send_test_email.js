import nodemailer from 'nodemailer'

// create account with email service eg. Ethereal as test service
const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "",
    pass: "",
  },
});

transporter.sendMail({
  from: '"Batch Processor" <notify@epic-app.com>', // sender address
  to: "participant-bootcamp@test.com", // list of receivers
  subject: "Bulk request complete.", // Subject line
  html: `Bulk request completed successfully at <strong>${Date.now()}</strong>`, // html body
}).then(info => console.log(info))