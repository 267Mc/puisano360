'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const SCHOOLS = [
  { id: '11111111-0000-0000-0000-000000000001', name: 'Gaborone International' },
  { id: '11111111-0000-0000-0000-000000000002', name: 'Westwood International' },
  { id: '11111111-0000-0000-0000-000000000003', name: 'Northside Primary' },
]

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole]         = useState<'parent' | 'teacher'>('parent')
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [schoolId, setSchoolId] = useState(SCHOOLS[0].id)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Create auth user
    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError || !data.user) {
      setError(authError?.message ?? 'Sign up failed.')
      setLoading(false)
      return
    }

    // Insert into appropriate profile table
    const table = role === 'teacher' ? 'teachers' : 'parents'
    const { error: insertError } = await supabase.from(table).insert({
      auth_id: data.user.id,
      full_name: fullName,
      email,
      school_id: schoolId,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess('Account created! You can now sign in.')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Puisano<span>360</span></h1>
          <p>Create your account to get started</p>
        </div>

        {error   && <div className="error-msg"   style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: '1rem' }}>{success}</div>}

        <form onSubmit={handleSignup} className="auth-form">
          {/* Role toggle */}
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
                }}
              >
                {r === 'parent' ? '👨‍👩‍👧 Parent' : '🏫 Teacher'}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Aone Motse"
              required
            />
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
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label>School</label>
            <select value={schoolId} onChange={e => setSchoolId(e.target.value)}>
              {SCHOOLS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
