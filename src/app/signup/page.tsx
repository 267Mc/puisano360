'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { useLang } from '@/lib/LanguageContext'
import { tr } from '@/lib/translations'
import LanguageToggle from '@/lib/LanguageToggle'

const SCHOOLS = [
  { id: '11111111-0000-0000-0000-000000000001', name: 'Gaborone International' },
  { id: '11111111-0000-0000-0000-000000000002', name: 'Westwood International' },
  { id: '11111111-0000-0000-0000-000000000003', name: 'Northside Primary' },
]

export default function SignupPage() {
  const router   = useRouter()
  const supabase = createClient()
  const { lang } = useLang()

  const [role, setRole]         = useState<'parent' | 'teacher'>('parent')
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [schoolId, setSchoolId] = useState(SCHOOLS[0].id)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError || !data.user) { setError(authError?.message ?? 'Sign up failed.'); setLoading(false); return }
    const table = role === 'teacher' ? 'teachers' : 'parents'
    const { error: insertError } = await supabase.from(table).insert({ auth_id: data.user.id, full_name: fullName, email, school_id: schoolId })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    setSuccess(tr('accountCreated', lang))
    setTimeout(() => router.push('/login'), 2000)
  }

  const toggleStyle = (active: boolean) => ({
    flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none',
    background: active ? 'var(--green)' : 'transparent',
    color: active ? 'white' : 'var(--text-muted)',
    fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.18s',
  } as React.CSSProperties)

  return (
    <div className="auth-wrapper">
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100 }}>
        <LanguageToggle />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img src="/logo.jpg" alt="Puisano360" style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p>{tr('getStarted', lang)}</p>
        </div>

        {error   && <div className="error-msg"   style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: '1rem' }}>{success}</div>}

        <form onSubmit={handleSignup} className="auth-form">
          <div style={{ display: 'flex', background: 'var(--off-white)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
            <button type="button" onClick={() => setRole('parent')} style={toggleStyle(role === 'parent')}>{tr('parentRole', lang)}</button>
            <button type="button" onClick={() => setRole('teacher')} style={toggleStyle(role === 'teacher')}>{tr('teacherRole', lang)}</button>
          </div>
          <div className="form-group">
            <label>{tr('fullName', lang)}</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Aone Motse" required />
          </div>
          <div className="form-group">
            <label>{tr('emailAddress', lang)}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>{tr('password', lang)}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={tr('minPassword', lang)} minLength={6} required />
          </div>
          <div className="form-group">
            <label>{tr('school', lang)}</label>
            <select value={schoolId} onChange={e => setSchoolId(e.target.value)}>
              {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
            {loading ? tr('creatingAccount', lang) : tr('createAccount', lang)}
          </button>
        </form>

        <div className="auth-footer">
          {tr('alreadyAccount', lang)}{' '}<Link href="/login">{tr('signInLink', lang)}</Link>
        </div>
      </div>
    </div>
  )
}