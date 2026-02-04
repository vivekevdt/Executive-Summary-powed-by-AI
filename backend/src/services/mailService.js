import transporter from '../config/mailer.js';

export const sendMailWithAttachment = async (filePath, recipientEmail) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipientEmail || process.env.EXECUTIVE_MAIL_TO,
    subject: 'Weekly Executive Summary',
    text: `
Dear Team,

Please find attached the SPE Weekly Executive Summary for this week.
 

Kindly review and share your feedback.

Regards,
    `,
    attachments: [{ path: filePath }]
  });
};

