import transporter from '../config/mailer.js';

export const sendMailWithAttachment = async (filePath) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EXECUTIVE_MAIL_TO,
    subject: 'Weekly Executive Summary',
    text: 'Please find the executive summary attached.',
    attachments: [{ path: filePath }]
  });
};
