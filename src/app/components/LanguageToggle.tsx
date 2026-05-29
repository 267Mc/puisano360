'use client'
import { useLang } from '@/lib/LanguageContext'

export default function LanguageToggle() {
  const { lang, setLang } = useLang()

  return (
    <div style={{
      display: 'flex',
      background: 'rgba(255,255,255,0.12)',
      borderRadius: '999px',
      padding: '3px',
      gap: '2px',
    }}>
      {(['en', 'tn'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: '0.3rem 0.85rem',
            borderRadius: '999px',
            border: 'none',
            background: lang === l ? 'var(--gold)' : 'transparent',
            color: lang === l ? 'white' : 'rgba(255,255,255,0.75)',
            fontWeight: lang === l ? 700 : 400,
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.18s',
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          {l === 'en' ? '🇬🇧 EN' : '🇧🇼 TN'}
        </button>
      ))}
    </div>
  )
}