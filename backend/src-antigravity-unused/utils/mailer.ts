import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = 'noreply@kartmaint.com',
  FRONTEND_URL = 'http://localhost:3000',
  NODE_ENV,
} = process.env;

const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

/** Lazily created transporter — only initialised when SMTP is configured */
function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Sends a password-reset email.
 * Falls back to console output in dev when SMTP is not configured.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<void> {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  if (!smtpConfigured) {
    // Dev fallback: log the link so you can test without a real SMTP server
    console.log('\n─────────────────────────────────────────────');
    console.log('📧 [DEV MODE] Password reset email would be sent to:', to);
    console.log('🔗 Reset link:', resetLink);
    console.log('─────────────────────────────────────────────\n');
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"KartMaint" <${SMTP_FROM}>`,
    to,
    subject: 'Reset your KartMaint password',
    text: `You requested a password reset.\n\nClick the link below to set a new password (valid for 1 hour):\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Reset your KartMaint password</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 24px;background:#e63946;color:#fff;
                  text-decoration:none;border-radius:6px;font-weight:bold;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#666;font-size:12px;">
          If you did not request this, you can safely ignore this email.<br>
          Link: ${resetLink}
        </p>
      </div>
    `,
  });
}

/**
 * Sends a welcome email with temp credentials to a newly created account.
 * Falls back to console output in dev when SMTP is not configured.
 */
export async function sendWelcomeEmail(
  to: string,
  fullName: string,
  tempPassword: string
): Promise<void> {
  const loginUrl = `${FRONTEND_URL}/login`;

  if (!smtpConfigured) {
    console.log('\n─────────────────────────────────────────────');
    console.log('📧 [DEV MODE] Welcome email would be sent to:', to);
    console.log('👤 Name:', fullName);
    console.log('🔑 Temp password:', tempPassword);
    console.log('─────────────────────────────────────────────\n');
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"KartMaint" <${SMTP_FROM}>`,
    to,
    subject: 'Your KartMaint account has been created',
    text: `Hello ${fullName},\n\nYour KartMaint account is ready.\n\nEmail: ${to}\nTemporary password: ${tempPassword}\n\nPlease log in at ${loginUrl} and change your password immediately.\n`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Welcome to KartMaint, ${fullName}!</h2>
        <p>Your account has been created by an administrator.</p>
        <table style="border:1px solid #eee;padding:12px;border-radius:6px;width:100%;">
          <tr><td><strong>Email</strong></td><td>${to}</td></tr>
          <tr><td><strong>Temp Password</strong></td><td style="font-family:monospace;">${tempPassword}</td></tr>
        </table>
        <p>You will be asked to set a new password on your first login.</p>
        <a href="${loginUrl}"
           style="display:inline-block;padding:12px 24px;background:#e63946;color:#fff;
                  text-decoration:none;border-radius:6px;font-weight:bold;margin:16px 0;">
          Log In Now
        </a>
      </div>
    `,
  });
}
