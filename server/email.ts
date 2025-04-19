import nodemailer from 'nodemailer';

interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp-pulse.com',
    port: 2525,
    secure: false,
    auth: {
      user: 'mrbeak123@gmail.com',
      pass: 'FSYt9Qija9HWfdW'
    }
  });
}

export async function sendEmail(data: EmailData, to: string = 'mrbeak123@gmail.com') {
  const { name, email, subject, message } = data;
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Science Carnival" <mrbeak123@gmail.com>`,
    to: to,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
  <p><strong>From:</strong> ${name} (${email})</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 20px;">
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  </div>
  <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
    This email was sent from the Science Carnival website contact form.
  </p>
</div>
    `,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
      'X-Mailru-Bypass-Spam': 'da',
      'X-SMTPAPI': JSON.stringify({
        category: 'contact_form'
      })
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function verifyEmailConnection() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Error establishing SMTP connection:', error);
    return false;
  }
}