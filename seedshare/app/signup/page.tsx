'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main signup page
    router.push('/auth/signup')
  }, [router])

  return null
}

