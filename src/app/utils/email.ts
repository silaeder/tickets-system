import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendResetCode = async (email: string, code: string) => {
  if (email === 'admin@admin.com') return;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Код для сброса пароля',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Сброс пароля</h2>
        <p>Вы запросили сброс пароля. Используйте следующий код для подтверждения:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <code style="font-size: 24px; color: #1f2937;">${code}</code>
        </div>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это сообщение.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendStatusUpdateEmail = async (
  email: string,
  formName: string,
  status: {
    approved: boolean;
    waiting: boolean;
    edits_required: boolean;
  },
  comment: string | null
) => {
  if (email === 'admin@admin.com') return;

  const getStatusText = (status: any) => {
    if (status.approved) return 'Одобрено';
    if (status.waiting) return 'Ожидает проверки';
    if (status.edits_required) return 'Требуются правки';
    return 'Отказано';
  };

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `Обновление статуса заявки "${formName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Обновление статуса заявки</h2>
        <p>Статус вашей заявки "${formName}" был обновлен.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Новый статус:</strong> ${getStatusText(status)}</p>
          ${comment ? `<p><strong>Комментарий:</strong> ${comment}</p>` : ''}
        </div>
        <p>Вы можете просмотреть подробности в своем личном кабинете.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};