'use client'
import Link from 'next/link'
import { useLang } from '@/lib/LanguageContext'
import { tr } from '@/lib/translations'
import LanguageToggle from '@/lib/LanguageToggle'

export default function Home() {
  const { lang } = useLang()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.jpg" alt="Puisano360 Logo" style={{ height: '42px', width: 'auto', borderRadius: '8px', background: 'white', padding: '2px', objectFit: 'contain' }} />
          <span className="nav-logo">Puisano<span>360</span></span>
        </div>
        <div className="nav-right">
          <LanguageToggle />
          <Link href="/login" className="btn btn-gold" style={{ fontSize: '0.9rem' }}>{tr('signIn', lang)}</Link>
        </div>
      </nav>

      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, var(--green) 0%, #0e3d24 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center',
        padding: '4rem 1.5rem', gap: '1.5rem',
      }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.25rem 2.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', marginBottom: '0.5rem', display: 'inline-block' }}>
          <img src="/logo.jpg" alt="Puisano360" style={{ height: '100px', width: 'auto', display: 'block', objectFit: 'contain' }} />
        </div>

        <div style={{ background: 'rgba(201,152,26,0.15)', border: '1px solid rgba(201,152,26,0.4)', borderRadius: '999px', padding: '0.4rem 1.2rem', color: 'var(--gold-light)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {tr('landingBadge', lang)}
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: 'white', lineHeight: 1.1, maxWidth: '700px' }}>
          {lang === 'en'
            ? <>Bridging Parents &amp; Teachers, <span style={{ color: 'var(--gold-light)' }}>Together.</span></>
            : <>Go Kgolaganya Batsw adi le Barutabana, <span style={{ color: 'var(--gold-light)' }}>Mmogo.</span></>
          }
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '520px', fontSize: '1.1rem', lineHeight: 1.7 }}>
          {tr('landingSubtitle', lang)}
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-gold" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            {tr('signIn', lang)}
          </Link>
          <Link href="/signup" className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.8rem 2rem', borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
            {tr('createAccount', lang)}
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          {(['featureReports','featureMessaging','featureMeetings','featureAnnounce'] as const).map(f => (
            <span key={f} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.88rem' }}>
              {tr(f, lang)}
            </span>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {tr('partnerSchools', lang)}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Gaborone International', 'Westwood International', 'Northside Primary'].map(s => (
              <span key={s} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', padding: '0.35rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}