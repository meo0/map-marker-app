const MEMBER_EMAILS: string[] = (process.env.MEMBER_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isMemberEmail(email: string): boolean {
  return MEMBER_EMAILS.includes(email.toLowerCase())
}
