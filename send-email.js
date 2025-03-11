const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.k-structures.com",
  port: 587,
  secure: false,
  auth: {
    user: "info@k-structures.com",
    pass: "$-bMyq(KMruR",
  },
  tls: {
    rejectUnauthorized: false
  }
});

const mailOptions = {
  from: '"K-Structures" <info@k-structures.com>',
  to: "thamkingjoe9@gmail.com",
  subject: "SMTP Test",
  text: "Hello, testing SMTP connection!"
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ Email sent:", info.response);
  }
});
