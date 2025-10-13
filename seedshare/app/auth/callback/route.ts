import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Email confirmed successfully
      return NextResponse.redirect(new URL(`/auth/login?confirmed=true`, requestUrl.origin))
    }
  }

  // Return error if no code or if exchange failed
  return NextResponse.redirect(new URL('/auth/login?error=Could not confirm email', requestUrl.origin))
}
