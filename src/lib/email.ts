import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOtpEmail(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Map Marker ログインコード: ${code}`,
    text: `あなたのログインコードは ${code} です。\nこのコードは5分間有効です。\n\nこのメールに心当たりがない場合は無視してください。`,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="text-align: center; color: #333;">Map Marker</h2>
        <p>あなたのログインコードは:</p>
        <div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 16px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">このコードは5分間有効です。</p>
        <p style="color: #999; font-size: 12px;">このメールに心当たりがない場合は無視してください。</p>
      </div>
    `,
  })
}
