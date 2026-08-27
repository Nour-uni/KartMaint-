const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTempPasswordEmail(to, tempPassword, fullName) {
  if (process.env.NODE_ENV === 'test') return;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Your KartMaint account',
    html: `
      <p>Hi ${fullName},</p>
      <p>An account has been created for you on KartMaint.</p>
      <p><strong>Email:</strong> ${to}<br/>
      <strong>Temporary password:</strong> ${tempPassword}</p>
      <p>You'll be asked to set a new password the first time you log in.</p>
      <p><a href="${process.env.FRONTEND_URL}/login">Log in here</a></p>
    `,
  });
}

async function sendPasswordResetEmail(to, resetLink) {
  if (process.env.NODE_ENV === 'test') return;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your KartMaint password',
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

async function sendEquipmentRequestResultEmail(to, fullName, itemName, quantity, approved) {
  if (process.env.NODE_ENV === 'test') return;
  const subject = approved ? 'Your equipment request was approved' : 'Your equipment request was rejected';
  const message = approved
    ? `Your request for ${quantity}× ${itemName} has been approved. You can now pick it up from stock.`
    : `Your request for ${quantity}× ${itemName} was rejected.`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: `
      <p>Hi ${fullName},</p>
      <p>${message}</p>
      <p><a href="${process.env.FRONTEND_URL}/mechanic-dashboard">View your dashboard</a></p>
    `,
  });
}

module.exports = {
  sendTempPasswordEmail,
  sendPasswordResetEmail,
  sendEquipmentRequestResultEmail,
};