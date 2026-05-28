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
  const router   = useRouter()
  const supabase = createClient()

  const [parent, setParent]             = useState<Parent | null>(null)
  const [parentAuthId, setParentAuthId] = useState<string>('')
  const [parentId, setParentId]         = useState<string>('')
  const [tab, setTab]                   = useState<'announcements'|'meetings'|'reports'|'messages'>('announcements')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [meetings, setMeetings]           = useState<Meeting[]>([])
  const [reports, setReports]             = useState<Report[]>([])
  const [messages, setMessages]           = useState<Message[]>([])
  const [teacher, setTeacher]             = useState<Teacher | null>(null)
  const [newMsg, setNewMsg]               = useState('')
  const [loading, setLoading]             = useState(true)
  const [sending, setSending]             = useState(false)
  const msgEnd   = useRef<HTMLDivElement>(null)
  const teacherRef = useRef<Teacher | null>(null)
  const parentAuthIdRef = useRef<string>('')

  useEffect(() => { loadAll() }, [])
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    setParentAuthId(user.id)
    parentAuthIdRef.current = user.id

    const { data: p } = await supabase
      .from('parents').select('*').eq('auth_id', user.id).single()
    if (!p) { router.push('/login'); return }
    setParent(p)
    setParentId(p.id)

    // Fetch teacher — try by school_id match
    const { data: teachers } = await supabase
      .from('teachers').select('id, full_name, auth_id').eq('school_id', p.school_id)
    
    const t = teachers && teachers.length > 0 ? teachers[0] : null
    setTeacher(t)
    teacherRef.current = t

    const [ann, meet] = await Promise.all([
      supabase.from('announcements').select('*, teachers(full_name)')
        .eq('school_id', p.school_id).order('created_at', { ascending: false }),
      supabase.from('pta_meetings').select('*, teachers(full_name)')
        .eq('school_id', p.school_id).order('scheduled_at', { ascending: true }),
    ])

    setAnnouncements(ann.data ?? [])
    setMeetings(meet.data ?? [])

    // Fetch reports separately — use parent.id (the UUID from parents table)
    await fetchReports(p.id)

    // Load initial messages
    if (t?.auth_id) {
      await loadMessages(user.id, t.auth_id)
      // Subscribe to realtime
      subscribeToMessages(user.id, t.auth_id)
    }

    setLoading(false)
  }

  async function fetchReports(pid: string) {
    const { data, error } = await supabase
      .from('progress_reports')
      .select('*, teachers(full_name)')
      .eq('parent_id', pid)
      .order('created_at', { ascending: false })
    setReports(data ?? [])
  }

  async function loadMessages(myAuthId: string, teacherAuthId: string) {
    const { data } = await supabase
      .from('messages').select('*')
      .or(`and(sender_id.eq.${myAuthId},receiver_id.eq.${teacherAuthId}),and(sender_id.eq.${teacherAuthId},receiver_id.eq.${myAuthId})`)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }

  function subscribeToMessages(myAuthId: string, teacherAuthId: string) {
    supabase
      .channel('parent-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new as Message
        // Only add if it's part of this conversation
        const isRelevant =
          (msg.sender_id === myAuthId    && msg.receiver_id === teacherAuthId) ||
          (msg.sender_id === teacherAuthId && msg.receiver_id === myAuthId)
        if (isRelevant) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      })
      .subscribe()
  }

  async function sendMessage() {
    if (!newMsg.trim() || !teacherRef.current?.auth_id || !parentAuthIdRef.current) return
    setSending(true)
    const content = newMsg.trim()
    setNewMsg('')

    await supabase.from('messages').insert({
      sender_id:   parentAuthIdRef.current,
      receiver_id: teacherRef.current.auth_id,
      sender_role: 'parent',
      content,
    })
    setSending(false)
  }

  async function signOut() {
    await supabase.channel('parent-messages').unsubscribe()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="loading"><div className="spinner" />Loading your dashboard…</div>
  )

  const now = new Date()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.jpg" alt="Puisano360" style={{ height: '38px', width: 'auto', borderRadius: '6px', background: 'white', padding: '2px', objectFit: 'contain' }} />
          <span className="nav-logo">Puisano<span>360</span></span>
        </div>
        <div className="nav-right">
          <span className="nav-user">👋 {parent?.full_name}</span>
          <button onClick={signOut} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome back, {parent?.full_name.split(' ')[0]}!</h1>
          <p>Stay connected with your child&apos;s school</p>
        </div>

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

        <div className="tabs">
          {([
            { key: 'announcements', label: '📢 Announcements' },
            { key: 'meetings',      label: '🎥 PTA Meetings'  },
            { key: 'reports',       label: '📊 Progress Reports' },
            { key: 'messages',      label: '💬 Messages' },
          ] as const).map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'announcements' && (
          <div className="card">
            <div className="section-title">School Announcements</div>
            {announcements.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📢</div><p>No announcements yet.</p></div>
            ) : announcements.map(a => (
              <div key={a.id} className="announcement-item">
                <h4>{a.title}</h4><p>{a.body}</p>
                <div className="date">By {a.teachers?.full_name} · {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'meetings' && (
          <div>
            <div className="section-title">PTA Meetings</div>
            {meetings.length === 0 ? (
              <div className="card"><div className="empty-state"><div className="empty-icon">🎥</div><p>No meetings scheduled yet.</p></div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {meetings.map(m => {
                  const date = new Date(m.scheduled_at)
                  const isPast = date < now
                  return (
                    <div key={m.id} className="meeting-card" style={{ opacity: isPast ? 0.7 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4>{m.title}</h4>
                        <span style={{ background: isPast ? 'rgba(201,152,26,0.3)' : 'rgba(255,255,255,0.2)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {isPast ? 'Past' : 'Upcoming'}
                        </span>
                      </div>
                      <div className="meeting-time">🗓 {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · 🕐 {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Hosted by {m.teachers?.full_name}</div>
                      {!isPast && <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" className="join-btn">🎥 Join Meeting</a>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'reports' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--gold-pale)' }}>
              <span className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Progress Reports</span>
              <button
                onClick={() => parent && fetchReports(parentId)}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.35rem 0.9rem' }}
              >
                🔄 Refresh
              </button>
            </div>
            {reports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <p>No reports uploaded yet. Your teacher will upload them here.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>If a report was just uploaded, tap Refresh above.</p>
              </div>
            ) : reports.map(r => (
              <div key={r.id} className="report-row">
                <div className="report-info">
                  <strong>{r.file_name || 'Progress Report'}</strong>
                  <span>{r.term} · Uploaded {new Date(r.created_at).toLocaleDateString('en-GB')} by {r.teachers?.full_name}</span>
                </div>
                <a href={r.report_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}>View PDF</a>
              </div>
            ))}
          </div>
        )}

        {tab === 'messages' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="section-title">
              {teacher ? `Chat with ${teacher.full_name}` : 'Messages'}
            </div>

            {!teacher ? (
              <div className="empty-state"><div className="empty-icon">💬</div><p>No teacher found for your school yet.</p></div>
            ) : !teacher.auth_id ? (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '1rem', fontSize: '0.9rem', color: '#856404' }}>
                ⚠️ Your teacher&apos;s account is not fully set up yet. Please ask your school to complete the setup.
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--green-pale)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                    {teacher.full_name.split(' ').pop()?.charAt(0) ?? 'T'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>{teacher.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Class Teacher</div>
                  </div>
                  <span style={{ marginLeft: 'auto', background: 'var(--green-pale)', color: 'var(--green)', border: '1px solid var(--green)', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.78rem', fontWeight: 600 }}>
                    🟢 Online
                  </span>
                </div>

                <div className="message-list" style={{ minHeight: '220px' }}>
                  {messages.length === 0 && (
                    <div className="empty-state"><div className="empty-icon">💬</div><p>No messages yet. Send a message to start the conversation!</p></div>
                  )}
                  {messages.map(m => {
                    const isMine = m.sender_role === 'parent'
                    return (
                      <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className={`message-bubble ${isMine ? 'sent' : 'received'}`}>{m.content}</div>
                        <div className="message-meta" style={{ alignSelf: isMine ? 'flex-end' : 'flex-start' }}>
                          {isMine ? 'You' : teacher.full_name} · {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={msgEnd} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    placeholder={`Message ${teacher.full_name}…`}
                    onKeyDown={e => e.key === 'Enter' && !sending && sendMessage()} />
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