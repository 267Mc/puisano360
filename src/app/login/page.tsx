'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { useLang } from '@/lib/LanguageContext'
import { tr } from '@/lib/translations'
import LanguageToggle from '@/components/LanguageToggle'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const { lang } = useLang()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<'parent' | 'teacher'>('parent')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showForgot, setShowForgot]       = useState(false)
  const [forgotEmail, setForgotEmail]     = useState('')
  const [forgotMsg, setForgotMsg]         = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.user) { setError(authError?.message ?? 'Login failed.'); setLoading(false); return }
    if (role === 'teacher') {
      const { data: teacher } = await supabase.from('teachers').select('id').eq('auth_id', data.user.id).single()
      if (!teacher) { setError('No teacher account found for this email.'); await supabase.auth.signOut(); setLoading(false); return }
      router.push('/teacherdashboard')
    } else {
      const { data: parent } = await supabase.from('parents').select('id').eq('auth_id', data.user.id).single()
      if (!parent) { setError('No parent account found for this email.'); await supabase.auth.signOut(); setLoading(false); return }
      router.push('/parentdashboard')
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault(); setForgotMsg(''); setForgotLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: window.location.origin + '/reset-password' })
    setForgotMsg(error ? 'Error: ' + error.message : 'Reset link sent! Check your email inbox.')
    if (!error) setForgotEmail('')
    setForgotLoading(false)
  }

  const toggleStyle = (active: boolean) => ({
    flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none',
    background: active ? 'var(--green)' : 'transparent',
    color: active ? 'white' : 'var(--text-muted)',
    fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.18s',
  } as React.CSSProperties)

  return (
    <div className="auth-wrapper">
      {/* Language toggle top-right */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100 }}>
        <LanguageToggle />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img src="/logo.jpg" alt="Puisano360" style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p>{showForgot ? tr('resetYourPassword', lang) : tr('welcomeBack', lang)}</p>
        </div>

        {showForgot ? (
          <>
            {forgotMsg && <div className={forgotMsg.startsWith('Error') ? 'error-msg' : 'success-msg'} style={{ marginBottom: '1rem' }}>{forgotMsg.startsWith('Error') ? forgotMsg : '✅ ' + forgotMsg}</div>}
            <form onSubmit={handleForgotPassword} className="auth-form">
              <div className="form-group">
                <label>{tr('yourEmail', lang)}</label>
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={forgotLoading} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                {forgotLoading ? tr('sending', lang) : tr('sendResetLink', lang)}
              </button>
            </form>
            <div className="auth-footer" style={{ marginTop: '1.25rem' }}>
              <button onClick={() => { setShowForgot(false); setForgotMsg('') }} style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                {tr('backToSignIn', lang)}
              </button>
            </div>
          </>
        ) : (
          <>
            {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleLogin} className="auth-form">
              <div style={{ display: 'flex', background: 'var(--off-white)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
                <button type="button" onClick={() => setRole('parent')} style={toggleStyle(role === 'parent')}>{tr('parentRole', lang)}</button>
                <button type="button" onClick={() => setRole('teacher')} style={toggleStyle(role === 'teacher')}>{tr('teacherRole', lang)}</button>
              </div>
              <div className="form-group">
                <label>{tr('emailAddress', lang)}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ margin: 0 }}>{tr('password', lang)}</label>
                  <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>
                    {tr('forgotPassword', lang)}
                  </button>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                {loading ? tr('signingIn', lang) : tr('signIn', lang)}
              </button>
            </form>
            <div className="auth-footer">
              {tr('noAccount', lang)}{' '}<Link href="/signup">{tr('createOne', lang)}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}