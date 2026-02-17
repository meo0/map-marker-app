'use client'

interface RoleBadgeProps {
  role: string
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  if (role !== 'member' && role !== 'admin') return null

  const label = role === 'admin' ? '管理者' : '部員'
  const className =
    role === 'admin'
      ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
      : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800'

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}
