const WINDOW_MS = 10 * 60 * 1000 // 10分
const EMAIL_MAX = 3
const IP_MAX = 10
const CLEANUP_INTERVAL_MS = 60 * 1000 // 60秒

const emailRequests = new Map<string, number[]>()
const ipRequests = new Map<string, number[]>()

function cleanupExpired() {
  const now = Date.now()
  for (const [key, timestamps] of emailRequests) {
    const valid = timestamps.filter((t) => now - t < WINDOW_MS)
    if (valid.length === 0) emailRequests.delete(key)
    else emailRequests.set(key, valid)
  }
  for (const [key, timestamps] of ipRequests) {
    const valid = timestamps.filter((t) => now - t < WINDOW_MS)
    if (valid.length === 0) ipRequests.delete(key)
    else ipRequests.set(key, valid)
  }
}

setInterval(cleanupExpired, CLEANUP_INTERVAL_MS).unref()

function checkLimit(
  store: Map<string, number[]>,
  key: string,
  max: number
): boolean {
  const now = Date.now()
  const timestamps = (store.get(key) || []).filter((t) => now - t < WINDOW_MS)
  if (timestamps.length >= max) return false
  timestamps.push(now)
  store.set(key, timestamps)
  return true
}

export function checkRateLimit(email: string, ip: string): { allowed: boolean; message?: string } {
  if (!checkLimit(emailRequests, email, EMAIL_MAX)) {
    return { allowed: false, message: "送信回数の上限に達しました。しばらく待ってから再試行してください。" }
  }
  if (!checkLimit(ipRequests, ip, IP_MAX)) {
    return { allowed: false, message: "リクエスト回数の上限に達しました。しばらく待ってから再試行してください。" }
  }
  return { allowed: true }
}
