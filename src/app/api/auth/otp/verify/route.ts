import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isMemberEmail } from "@/lib/member-whitelist"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "メールアドレスとコードを入力してください。" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 未使用かつ未期限切れのOTPを検索
    const otpToken = await prisma.otpToken.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otpToken) {
      return NextResponse.json({ error: "コードが期限切れです。新しいコードを送信してください。" }, { status: 400 })
    }

    // 試行回数チェック（最大5回）
    if (otpToken.attempts >= 5) {
      await prisma.otpToken.update({
        where: { id: otpToken.id },
        data: { used: true },
      })
      return NextResponse.json({ error: "試行回数の上限に達しました。新しいコードを送信してください。" }, { status: 400 })
    }

    // コード照合
    if (otpToken.code !== code) {
      await prisma.otpToken.update({
        where: { id: otpToken.id },
        data: { attempts: otpToken.attempts + 1 },
      })
      const remaining = 4 - otpToken.attempts
      return NextResponse.json(
        { error: `コードが正しくありません。残り${remaining}回試行できます。` },
        { status: 400 }
      )
    }

    // OTPをused=trueに更新
    await prisma.otpToken.update({
      where: { id: otpToken.id },
      data: { used: true },
    })

    // ユーザー検索 or 新規作成
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      const role = isMemberEmail(normalizedEmail) ? "member" : "user"
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          role,
        },
      })
    } else if (user.role === "user" && isMemberEmail(normalizedEmail)) {
      user = await prisma.user.update({
        where: { email: normalizedEmail },
        data: { role: "member" },
      })
    }

    // セッション作成
    const sessionToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30日

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    })

    // セッションCookieを設定
    const isSecure = process.env.NODE_ENV === "production"
    const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token"

    const response = NextResponse.json({ success: true })
    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      expires,
    })

    return response
  } catch {
    console.error("OTP検証エラー")
    return NextResponse.json({ error: "認証に失敗しました。もう一度お試しください。" }, { status: 500 })
  }
}
