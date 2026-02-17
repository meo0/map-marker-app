'use client'

import { signIn, useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) router.replace(callbackUrl)
  }, [session, router, callbackUrl])

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setStep('code')
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      window.location.href = callbackUrl
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setCode('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setError('')
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="max-w-sm w-full mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-900/50 p-8">
          <h1 className="text-2xl font-bold text-center mb-2 dark:text-gray-100">Map Marker</h1>
          <p className="text-gray-700 dark:text-gray-300 text-center text-sm mb-8">
            ログインしてマーカーを投稿しよう
          </p>

          {step === 'email' ? (
            <>
              <div className="space-y-3">
                <button
                  onClick={() => signIn('google', { callbackUrl })}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Googleでログイン
                </button>
              </div>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 border-t border-gray-200 dark:border-slate-700" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">または</span>
                <div className="flex-1 border-t border-gray-200 dark:border-slate-700" />
              </div>

              <form onSubmit={handleSendOtp} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレス"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 dark:text-gray-100 dark:bg-slate-700"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? '送信中...' : 'ログインコードを送信'}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm text-center">
                <span className="font-medium">{email}</span> にコードを送信しました
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6桁のコード"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center tracking-[0.3em] text-lg text-gray-900 dark:text-gray-100 dark:bg-slate-700"
                />
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? '認証中...' : '認証する'}
                </button>
              </form>

              <div className="flex justify-between text-sm">
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  コードを再送信
                </button>
                <button
                  onClick={() => { setStep('email'); setCode(''); setError('') }}
                  className="text-gray-700 dark:text-gray-300 hover:underline"
                >
                  戻る
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center mt-4">{error}</p>
          )}

          <p className="text-gray-600 dark:text-gray-400 text-xs text-center mt-6">
            ホワイトリスト登録済みのメールアドレスでログインすると部員バッジが付与されます
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <p className="dark:text-gray-300">読み込み中...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
