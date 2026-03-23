import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Initialize the Supabase Client for Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, val: string, options: CookieOptions) {
          // Changed 'value' to 'value: val' to fix the shorthand error
          request.cookies.set({ name, value: val, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: val, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Changed 'value' to 'value: ""' to fix the shorthand error
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 2. Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  const url = request.nextUrl.clone()

  // 3. PROTECTION: If not logged in, send to login page
  if (!session && (url.pathname.startsWith('/teacher') || url.pathname.startsWith('/parent'))) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 4. ROLE-BASED REDIRECT: Ensure Teachers stay in /teacher and Parents in /parent
  if (session) {
    const role = session.user.user_metadata.role

    if (url.pathname.startsWith('/parent') && role === 'teacher') {
      url.pathname = '/teacher'
      return NextResponse.redirect(url)
    }

    if (url.pathname.startsWith('/teacher') && role === 'parent') {
      url.pathname = '/parent'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/teacher/:path*', '/parent/:path*', '/login'],
}