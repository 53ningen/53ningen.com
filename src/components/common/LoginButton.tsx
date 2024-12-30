'use client'

import { useDictionary } from '@/i18n/hook'
import { useUser } from '@auth0/nextjs-auth0/client'

export const LoginButton = () => {
  const { user, error, isLoading } = useUser()
  const { common: t } = useDictionary()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>
  return (
    <a href={user ? '/admin' : '/admin'} className="py-2 px-4 rounded text-white hover:text-white text-xs">
      {user ? t.admin : t.login}
    </a>
  )
}
