'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type Parent = { id: string; full_name: string; school_id: string; email: string }
type Announcement = { id: string; title: string; body: string; created_at: string; teachers: { full_name: string } }
type Meeting = { id: string; title: string; meeting_link: string; scheduled_at: string; teachers: { full_name: string } }
type Report = { id: string; file_name: string; report_url: string; term: string; created_at: string; teachers: { full_name: string } }
type Message = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string; sender_role: string }
type Teacher = { id: string; full_name: string; auth_id: string }

export default function ParentDashboard() {
  const router  = useRouter()
  const supabase = createClient()

  const [parent, setParent]               = useState<Parent | null>(null)
  const [tab, setTab]                     = useState<'announcements' | 'meetings' | 'reports' | 'messages'>('announcements')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [meetings, setMeetings]           = useState<Meeting[]>([])
  const [reports, setReports]             = useState<Report[]>([])
  const [messages, setMessages]           = useState<Message[]>([])
  const [teacher, setTeacher]             = useState<Teacher | null>(null)
  const [newMsg, setNewMsg]               = useState('')
  const [loading, setLoading]             = useState(true)
  const [sending, setSending]             = useState(false)
  const msgEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadParent()
  }, [])

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadParent() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: p } = await supabase
      .from('parents')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (!p) { router.push('/login'); return }
    setParent(p)

    // Load teacher for this school
    const { data: t } = await supabase
      .from('teachers')
      .select('id, full_name, auth_id')
      .eq('school_id', p.school_id)
      .single()
    setTeacher(t)

    // Load all data
    const [ann, meet, rep, msg] = await Promise.all([
      supabase.from('announcements')
        .select('*, teachers(full_name)')
        .eq('school_id', p.school_id)
        .order('created_at', { ascending: false }),

      supabase.from('pta_meetings')
        .select('*, teachers(full_name)')
        .eq('school_id', p.school_id)
        .order('scheduled_at', { ascending: true }),

      supabase.from('progress_reports')
        .select('*, teachers(full_name)')
        .eq('parent_id', p.id)
        .order('created_at', { ascending: false }),

      supabase.from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true }),
    ])

    setAnnouncements(ann.data ?? [])
    setMeetings(meet.data ?? [])
    setReports(rep.data ?? [])
    setMessages(msg.data ?? [])
    setLoading(false)
  }

  async function sendMessage() {
    if (!newMsg.trim() || !teacher || !parent) return
    setSending(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: teacher.auth_id,
      sender_role: 'parent',
      content: newMsg.trim(),
    }).select().single()

    if (data) setMessages(prev => [...prev, data])
    setNewMsg('')
    setSending(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      Loading your dashboard…
    </div>
  )

  const now = new Date()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Nav */}
      <nav className="nav">
        <span className="nav-logo">Puisano<span>360</span></span>
        <div className="nav-right">
          <span className="nav-user">👋 {parent?.full_name}</span>
          <button onClick={signOut} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {parent?.full_name.split(' ')[0]}!</h1>
          <p>Stay connected with your child&apos;s school</p>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon">📢</div>
            <div className="stat-num">{announcements.length}</div>
            <div className="stat-label">Announcements</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-num">{meetings.filter(m => new Date(m.scheduled_at) >= now).length}</div>
            <div className="stat-label">Upcoming Meetings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-num">{reports.length}</div>
            <div className="stat-label">Progress Reports</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {([
            { key: 'announcements', label: '📢 Announcements' },
            { key: 'meetings',      label: '🎥 PTA Meetings' },
            { key: 'reports',       label: '📊 Progress Reports' },
            { key: 'messages',      label: '💬 Messages' },
          ] as const).map(t => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Announcements ── */}
        {tab === 'announcements' && (
          <div className="card">
            <div className="section-title">School Announcements</div>
            {announcements.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📢</div>
                <p>No announcements yet.</p>
              </div>
            ) : announcements.map(a => (
              <div key={a.id} className="announcement-item">
                <h4>{a.title}</h4>
                <p>{a.body}</p>
                <div className="date">
                  By {a.teachers?.full_name} · {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PTA Meetings ── */}
        {tab === 'meetings' && (
          <div>
            <div className="section-title">PTA Meetings</div>
            {meetings.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">🎥</div>
                  <p>No meetings scheduled yet.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {meetings.map(m => {
                  const date = new Date(m.scheduled_at)
                  const isPast = date < now
                  return (
                    <div key={m.id} className="meeting-card" style={{ opacity: isPast ? 0.7 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4>{m.title}</h4>
                        <span className={`badge ${isPast ? 'badge-gold' : 'badge-green'}`} style={{ background: isPast ? 'rgba(201,152,26,0.3)' : 'rgba(255,255,255,0.2)', color: 'white' }}>
                          {isPast ? 'Past' : 'Upcoming'}
                        </span>
                      </div>
                      <div className="meeting-time">
                        🗓 {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        &nbsp;·&nbsp;
                        🕐 {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Hosted by {m.teachers?.full_name}</div>
                      {!isPast && (
                        <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" className="join-btn">
                          🎥 Join Meeting
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Progress Reports ── */}
        {tab === 'reports' && (
          <div className="card">
            <div className="section-title">Progress Reports</div>
            {reports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <p>No reports uploaded yet. Your teacher will upload them here.</p>
              </div>
            ) : reports.map(r => (
              <div key={r.id} className="report-row">
                <div className="report-info">
                  <strong>{r.file_name}</strong>
                  <span>{r.term} · Uploaded {new Date(r.created_at).toLocaleDateString('en-GB')} by {r.teachers?.full_name}</span>
                </div>
                <a href={r.report_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
                  View PDF
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── Messages ── */}
        {tab === 'messages' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="section-title">
              Chat with {teacher?.full_name ?? 'your teacher'}
            </div>

            {!teacher ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>No teacher found for your school yet.</p>
              </div>
            ) : (
              <>
                <div className="message-list">
                  {messages.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">💬</div>
                      <p>No messages yet. Say hello!</p>
                    </div>
                  )}
                  {messages.map(m => (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className={`message-bubble ${m.sender_role === 'parent' ? 'sent' : 'received'}`}>
                        {m.content}
                      </div>
                      <div className="message-meta" style={{ alignSelf: m.sender_role === 'parent' ? 'flex-end' : 'flex-start' }}>
                        {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  <div ref={msgEnd} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder="Type a message…"
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} className="btn btn-primary" disabled={sending || !newMsg.trim()}>
                    {sending ? '…' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
