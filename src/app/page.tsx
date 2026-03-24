'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav className="nav">
        <span className="nav-logo">Puisano<span>360</span></span>
        <div className="nav-right">
          <Link href="/login" className="btn btn-gold" style={{ fontSize: '0.9rem' }}>Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, var(--green) 0%, #0e3d24 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        gap: '1.5rem',
      }}>
        <div style={{
          background: 'rgba(201,152,26,0.15)',
          border: '1px solid rgba(201,152,26,0.4)',
          borderRadius: '999px',
          padding: '0.4rem 1.2rem',
          color: 'var(--gold-light)',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Botswana School Community Portal
        </div>

        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          color: 'white',
          lineHeight: 1.1,
          maxWidth: '700px',
        }}>
          Bridging Parents &amp; Teachers,{' '}
          <span style={{ color: 'var(--gold-light)' }}>Together.</span>
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '520px', fontSize: '1.1rem', lineHeight: 1.7 }}>
          Attend PTA meetings virtually, view your child&apos;s progress reports,
          and communicate directly with their teacher — all in one place.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-gold" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            Sign In
          </Link>
          <Link href="/signup" className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.8rem 2rem', borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
            Create Account
          </Link>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
          {['📊 Progress Reports', '💬 Direct Messaging', '🎥 Virtual PTA Meetings', '📢 Announcements'].map(f => (
            <span key={f} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              fontSize: '0.88rem',
            }}>{f}</span>
          ))}
        </div>

        {/* Schools */}
        <div style={{ marginTop: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Partner Schools
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Gaborone International', 'Westwood International', 'Northside Primary'].map(s => (
              <span key={s} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                padding: '0.35rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
