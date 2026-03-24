'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type Teacher = { id: string; full_name: string; school_id: string; auth_id: string; email: string }
type Parent  = { id: string; full_name: string; email: string; auth_id: string }
type Announcement = { id: string; title: string; body: string; created_at: string }
type Meeting = { id: string; title: string; meeting_link: string; scheduled_at: string }
type Report = { id: string; file_name: string; report_url: string; term: string; created_at: string; parents: { full_name: string } }
type Message = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string; sender_role: string }

export default function TeacherDashboard() {
  const router   = useRouter()
  const supabase = createClient()

  const [teacher, setTeacher]             = useState<Teacher | null>(null)
  const [parents, setParents]             = useState<Parent[]>([])
  const [tab, setTab]                     = useState<'announcements' | 'meetings' | 'reports' | 'messages'>('announcements')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [meetings, setMeetings]           = useState<Meeting[]>([])
  const [reports, setReports]             = useState<Report[]>([])
  const [messages, setMessages]           = useState<Message[]>([])
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [newMsg, setNewMsg]               = useState('')
  const [sending, setSending]             = useState(false)
  const [loading, setLoading]             = useState(true)
  const msgEnd = useRef<HTMLDivElement>(null)

  // Forms
  const [annTitle, setAnnTitle]     = useState('')
  const [annBody, setAnnBody]       = useState('')
  const [annLoading, setAnnLoading] = useState(false)

  const [meetTitle, setMeetTitle]     = useState('')
  const [meetLink, setMeetLink]       = useState('')
  const [meetDate, setMeetDate]       = useState('')
  const [meetLoading, setMeetLoading] = useState(false)

  const [repFile, setRepFile]         = useState<File | null>(null)
  const [repParent, setRepParent]     = useState('')
  const [repTerm, setRepTerm]         = useState('Term 1')
  const [repLoading, setRepLoading]   = useState(false)
  const [repMsg, setRepMsg]           = useState('')

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: t } = await supabase
      .from('teachers')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (!t) { router.push('/login'); return }
    setTeacher(t)

    const [pars, ann, meet, rep] = await Promise.all([
      supabase.from('parents').select('id, full_name, email, auth_id').eq('school_id', t.school_id),
      supabase.from('announcements').select('*').eq('teacher_id', t.id).order('created_at', { ascending: false }),
      supabase.from('pta_meetings').select('*').eq('teacher_id', t.id).order('scheduled_at', { ascending: true }),
      supabase.from('progress_reports').select('*, parents(full_name)').eq('teacher_id', t.id).order('created_at', { ascending: false }),
    ])

    setParents(pars.data ?? [])
    setAnnouncements(ann.data ?? [])
    setMeetings(meet.data ?? [])
    setReports(rep.data ?? [])
    if (pars.data && pars.data.length > 0) setSelectedParent(pars.data[0])
    setLoading(false)
  }

  async function loadMessages(parentAuthId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true })
    const filtered = (data ?? []).filter(m =>
      m.sender_id === parentAuthId || m.receiver_id === parentAuthId
    )
    setMessages(filtered)
  }

  useEffect(() => {
    if (selectedParent) loadMessages(selectedParent.auth_id)
  }, [selectedParent])

  async function postAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    if (!teacher) return
    setAnnLoading(true)
    const { data } = await supabase.from('announcements').insert({
      teacher_id: teacher.id,
      school_id: teacher.school_id,
      title: annTitle,
      body: annBody,
    }).select().single()
    if (data) setAnnouncements(prev => [data, ...prev])
    setAnnTitle(''); setAnnBody('')
    setAnnLoading(false)
  }

  async function scheduleMeeting(e: React.FormEvent) {
    e.preventDefault()
    if (!teacher) return
    setMeetLoading(true)
    const { data } = await supabase.from('pta_meetings').insert({
      teacher_id: teacher.id,
      school_id: teacher.school_id,
      title: meetTitle,
      meeting_link: meetLink,
      scheduled_at: new Date(meetDate).toISOString(),
    }).select().single()
    if (data) setMeetings(prev => [...prev, data])
    setMeetTitle(''); setMeetLink(''); setMeetDate('')
    setMeetLoading(false)
  }

  async function uploadReport(e: React.FormEvent) {
    e.preventDefault()
    if (!repFile || !teacher || !repParent) return
    setRepLoading(true)
    setRepMsg('')

    const fileName = `${repParent}/${Date.now()}_${repFile.name}`
    const { error: upErr } = await supabase.storage.from('reports').upload(fileName, repFile)

    if (upErr) { setRepMsg('Upload failed: ' + upErr.message); setRepLoading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('reports').getPublicUrl(fileName)

    const parent = parents.find(p => p.id === repParent)
    const { data: inserted } = await supabase.from('progress_reports').insert({
      teacher_id: teacher.id,
      parent_id: repParent,
      school_id: teacher.school_id,
      file_name: repFile.name,
      report_url: publicUrl,
      term: repTerm,
    }).select('*, parents(full_name)').single()

    if (inserted) setReports(prev => [inserted, ...prev])
    setRepMsg(`✅ Report uploaded for ${parent?.full_name}`)
    setRepFile(null)
    setRepLoading(false)
  }

  async function sendMessage() {
    if (!newMsg.trim() || !selectedParent || !teacher) return
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedParent.auth_id,
      sender_role: 'teacher',
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
    <div className="loading"><div className="spinner" />Loading your dashboard…</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <nav className="nav">
        <span className="nav-logo">Puisano<span>360</span></span>
        <div className="nav-right">
          <span className="nav-user">🏫 {teacher?.full_name}</span>
          <button onClick={signOut} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Teacher Dashboard</h1>
          <p>Manage your class communications and updates</p>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon">👨‍👩‍👧</div>
            <div className="stat-num">{parents.length}</div>
            <div className="stat-label">Parents in School</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📢</div>
            <div className="stat-num">{announcements.length}</div>
            <div className="stat-label">Announcements Posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-num">{reports.length}</div>
            <div className="stat-label">Reports Uploaded</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {([
            { key: 'announcements', label: '📢 Post Announcement' },
            { key: 'meetings',      label: '🎥 Schedule Meeting' },
            { key: 'reports',       label: '📊 Upload Reports' },
            { key: 'messages',      label: '💬 Message Parents' },
          ] as const).map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Announcements ── */}
        {tab === 'announcements' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title">Post New Announcement</div>
              <form onSubmit={postAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Title</label>
                  <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="e.g. School Sports Day" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} placeholder="Write your announcement here…" rows={5} required style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={annLoading}>
                  {annLoading ? 'Posting…' : '📢 Post Announcement'}
                </button>
              </form>
            </div>

            <div className="card">
              <div className="section-title">Your Announcements</div>
              {announcements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📢</div>
                  <p>No announcements yet.</p>
                </div>
              ) : announcements.map(a => (
                <div key={a.id} className="announcement-item">
                  <h4>{a.title}</h4>
                  <p>{a.body}</p>
                  <div className="date">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Meetings ── */}
        {tab === 'meetings' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title">Schedule PTA Meeting</div>
              <form onSubmit={scheduleMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Meeting Title</label>
                  <input value={meetTitle} onChange={e => setMeetTitle(e.target.value)} placeholder="e.g. Term 2 PTA Meeting" required />
                </div>
                <div className="form-group">
                  <label>Video Call Link (Google Meet / Zoom)</label>
                  <input value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." required />
                </div>
                <div className="form-group">
                  <label>Date &amp; Time</label>
                  <input type="datetime-local" value={meetDate} onChange={e => setMeetDate(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={meetLoading}>
                  {meetLoading ? 'Scheduling…' : '📅 Schedule Meeting'}
                </button>
              </form>
            </div>

            <div className="card">
              <div className="section-title">Scheduled Meetings</div>
              {meetings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>No meetings scheduled yet.</p>
                </div>
              ) : meetings.map(m => (
                <div key={m.id} className="meeting-card" style={{ marginBottom: '1rem' }}>
                  <h4>{m.title}</h4>
                  <div className="meeting-time">
                    {new Date(m.scheduled_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}
                    {new Date(m.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" className="join-btn">Open Link</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reports ── */}
        {tab === 'reports' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title">Upload Progress Report</div>
              {repMsg && <div className="success-msg" style={{ marginBottom: '1rem' }}>{repMsg}</div>}
              <form onSubmit={uploadReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Select Parent</label>
                  <select value={repParent} onChange={e => setRepParent(e.target.value)} required>
                    <option value="">— Choose parent —</option>
                    {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Term</label>
                  <select value={repTerm} onChange={e => setRepTerm(e.target.value)}>
                    <option>Term 1</option>
                    <option>Term 2</option>
                    <option>Term 3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>PDF Report File</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setRepFile(e.target.files?.[0] ?? null)}
                    required
                    style={{ padding: '0.5rem 0' }}
                  />
                </div>
                <button type="submit" className="btn btn-gold" disabled={repLoading || !repFile}>
                  {repLoading ? 'Uploading…' : '📤 Upload Report'}
                </button>
              </form>
            </div>

            <div className="card">
              <div className="section-title">Uploaded Reports</div>
              {reports.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p>No reports uploaded yet.</p>
                </div>
              ) : reports.map(r => (
                <div key={r.id} className="report-row">
                  <div className="report-info">
                    <strong>{r.file_name}</strong>
                    <span>{r.term} · {r.parents?.full_name} · {new Date(r.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <a href={r.report_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        {tab === 'messages' && (
          <div className="grid-2">
            {/* Parent selector */}
            <div className="card">
              <div className="section-title">Parents</div>
              {parents.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">👤</div><p>No parents in your school yet.</p></div>
              ) : parents.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedParent(p)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                    background: selectedParent?.id === p.id ? 'var(--green-pale)' : 'transparent',
                    border: `1px solid ${selectedParent?.id === p.id ? 'var(--green)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{p.full_name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.email}</div>
                </div>
              ))}
            </div>

            {/* Chat panel */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="section-title">
                {selectedParent ? `Chat with ${selectedParent.full_name}` : 'Select a parent'}
              </div>
              <div className="message-list">
                {messages.length === 0 && (
                  <div className="empty-state"><div className="empty-icon">💬</div><p>No messages yet.</p></div>
                )}
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={`message-bubble ${m.sender_role === 'teacher' ? 'sent' : 'received'}`}>
                      {m.content}
                    </div>
                    <div className="message-meta" style={{ alignSelf: m.sender_role === 'teacher' ? 'flex-end' : 'flex-start' }}>
                      {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={msgEnd} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder={selectedParent ? 'Type a message…' : 'Select a parent first'}
                  disabled={!selectedParent}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} className="btn btn-primary" disabled={sending || !newMsg.trim() || !selectedParent}>
                  {sending ? '…' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
