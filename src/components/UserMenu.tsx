'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import RoleBadge from '@/components/RoleBadge'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-blue-400 animate-pulse" />
  }

  if (!session) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50 dark:hover:bg-slate-600"
      >
        ログイン
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <RoleBadge role={session.user.role} />
      <span className="text-sm hidden sm:inline">{session.user.name}</span>
      {session.user.image ? (
        <img
          src={session.user.image}
          alt=""
          className="w-8 h-8 rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-bold">
          {session.user.name?.[0] || '?'}
        </div>
      )}
      <button
        onClick={() => signOut()}
        className="text-blue-100 hover:text-white text-sm"
      >
        ログアウト
      </button>
    </div>
  )
}
