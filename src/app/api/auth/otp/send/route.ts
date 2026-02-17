import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOtpEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    const rateCheck = checkRateLimit(normalizedEmail, ip)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.message }, { status: 429 })
    }

    // 既存の未使用OTPを無効化
    await prisma.otpToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    })

    // 6桁ランダムコード生成
    const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0")

    // DBに保存（有効期限5分）
    await prisma.otpToken.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        ipAddress: ip,
      },
    })

    // 期限切れOTPの定期クリーンアップ（1時間以上前のもの）
    await prisma.otpToken.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
    })

    // メール送信
    await sendOtpEmail(normalizedEmail, code)

    return NextResponse.json({ success: true })
  } catch {
    console.error("OTP送信エラー")
    return NextResponse.json({ error: "メールの送信に失敗しました。しばらく待ってから再試行してください。" }, { status: 500 })
  }
}
