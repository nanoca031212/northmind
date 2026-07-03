import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function renderEmailTemplate(bodyHtml: string) {
  return `<div style="background:#f4f4f4;padding:40px 0;font-family:Arial, Helvetica, sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #eaeaea;">
    <div style="padding:32px 32px 24px; text-align:center; border-bottom: 1px solid #eaeaea;">
      <div style="font-size:14px; font-weight:900; letter-spacing:0.3em; text-transform:uppercase; color:#000000;">
        North Mind
      </div>
    </div>
    <div style="padding:32px; color:#222222; font-size:14px; line-height:1.7;">
      ${bodyHtml}
    </div>
    <div style="padding: 24px 32px; border-top: 1px solid #eaeaea; text-align: center;">
      <div style="font-size:10px; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; color:#000000; margin-bottom: 12px;">
        North Mind
      </div>
      <p style="margin:0;font-size:11px;line-height:1.6;color:#666666; letter-spacing: 0.05em;">
        This is an automated order notification.<br>
        &copy; 2026 North Mind. ALL RIGHTS RESERVED.
      </p>
    </div>
  </div>
</div>`;
}

export async function sendBrandEmail(to: string, subject: string, bodyHtml: string) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html: renderEmailTemplate(bodyHtml),
  });
}
