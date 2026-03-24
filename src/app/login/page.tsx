'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<'parent' | 'teacher'>('parent')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError(authError?.message ?? 'Login failed. Please try again.')
      setLoading(false)
      return
    }

    // Check which table this user belongs to
    if (role === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('auth_id', data.user.id)
        .single()

      if (!teacher) {
        setError('No teacher account found for this email.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      router.push('/teacherdashboard')
    } else {
      const { data: parent } = await supabase
        .from('parents')
        .select('id')
        .eq('auth_id', data.user.id)
        .single()

      if (!parent) {
        setError('No parent account found for this email.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      router.push('/parentdashboard')
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Puisano<span>360</span></h1>
          <p>Welcome back — sign in to continue</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          {/* Role Toggle */}
          <div style={{ display: 'flex', background: 'var(--off-white)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
            {(['parent', 'teacher'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: role === r ? 'var(--green)' : 'transparent',
                  color: role === r ? 'white' : 'var(--text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.18s',
                  textTransform: 'capitalize',
                }}
              >
                {r === 'parent' ? '👨‍👩‍👧 Parent' : '🏫 Teacher'}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/signup">Create one</Link>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.85rem',
          background: 'var(--green-pale)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--green)' }}>Demo accounts</strong><br />
          Parent: aone@puisano360.com<br />
          Teacher: thabo@puisano360.com<br />
          (use the password you set in Supabase)
        </div>
      </div>
    </div>
  )
}
