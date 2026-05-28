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

const ZOOM_LINK = 'https://us05web.zoom.us/j/83583305542?pwd=u5NGRNSfKPeexY1KcT4sQRvgQaE0k8.1'

export default function TeacherDashboard() {
  const router   = useRouter()
  const supabase = createClient()

  const [teacher, setTeacher]             = useState<Teacher | null>(null)
  const [parents, setParents]             = useState<Parent[]>([])
  const [tab, setTab]                     = useState<'announcements'|'meetings'|'reports'|'messages'>('announcements')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [meetings, setMeetings]           = useState<Meeting[]>([])
  const [reports, setReports]             = useState<Report[]>([])
  const [messages, setMessages]           = useState<Message[]>([])
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [newMsg, setNewMsg]               = useState('')
  const [sending, setSending]             = useState(false)
  const [loading, setLoading]             = useState(true)

  const [annTitle, setAnnTitle]     = useState('')
  const [annBody, setAnnBody]       = useState('')
  const [annLoading, setAnnLoading] = useState(false)

  const [meetTitle, setMeetTitle]     = useState('')
  const [meetLink, setMeetLink]       = useState(ZOOM_LINK)
  const [meetDate, setMeetDate]       = useState('')
  const [meetLoading, setMeetLoading] = useState(false)

  const [repFile, setRepFile]       = useState<File | null>(null)
  const [repParent, setRepParent]   = useState('')
  const [repTerm, setRepTerm]       = useState('Term 1')
  const [repLoading, setRepLoading] = useState(false)
  const [repMsg, setRepMsg]         = useState('')

  const msgEnd          = useRef<HTMLDivElement>(null)
  const teacherRef      = useRef<Teacher | null>(null)
  const selectedParentRef = useRef<Parent | null>(null)
  const channelRef      = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => { loadData() }, [])
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: t } = await supabase.from('teachers').select('*').eq('auth_id', user.id).single()
    if (!t) { router.push('/login'); return }
    setTeacher(t)
    teacherRef.current = t

    const [pars, ann, meet, rep] = await Promise.all([
      supabase.from('parents').select('id, full_name, email, auth_id').eq('school_id', t.school_id),
      supabase.from('announcements').select('*').eq('teacher_id', t.id).order('created_at', { ascending: false }),
      supabase.from('pta_meetings').select('*').eq('teacher_id', t.id).order('scheduled_at', { ascending: true }),
      supabase.from('progress_reports').select('*, parents(full_name)').eq('teacher_id', t.id).order('created_at', { ascending: false }),
    ])

    const parentList = pars.data ?? []
    setParents(parentList)
    setAnnouncements(ann.data ?? [])
    setMeetings(meet.data ?? [])
    setReports(rep.data ?? [])

    if (parentList.length > 0) {
      setSelectedParent(parentList[0])
      selectedParentRef.current = parentList[0]
      await loadMessages(user.id, parentList[0].auth_id)
    }

    // Subscribe to all messages for this teacher
    subscribeToMessages(user.id)
    setLoading(false)
  }

  async function loadMessages(teacherAuthId: string, parentAuthId: string) {
    if (!parentAuthId) return
    const { data } = await supabase
      .from('messages').select('*')
      .or(`and(sender_id.eq.${teacherAuthId},receiver_id.eq.${parentAuthId}),and(sender_id.eq.${parentAuthId},receiver_id.eq.${teacherAuthId})`)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }

  function subscribeToMessages(teacherAuthId: string) {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }
    const ch = supabase
      .channel('teacher-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new as Message
        const currentParent = selectedParentRef.current
        if (!currentParent?.auth_id) return
        const isRelevant =
          (msg.sender_id === teacherAuthId && msg.receiver_id === currentParent.auth_id) ||
          (msg.sender_id === currentParent.auth_id && msg.receiver_id === teacherAuthId)
        if (isRelevant) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      })
      .subscribe()
    channelRef.current = ch
  }

  async function selectParent(p: Parent) {
    setSelectedParent(p)
    selectedParentRef.current = p
    setMessages([])
    if (teacherRef.current?.auth_id && p.auth_id) {
      await loadMessages(teacherRef.current.auth_id, p.auth_id)
    }
  }

  async function sendMessage() {
    if (!newMsg.trim() || !selectedParentRef.current || !teacherRef.current) return
    setSending(true)
    const content = newMsg.trim()
    setNewMsg('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('messages').insert({
      sender_id:   user.id,
      receiver_id: selectedParentRef.current.auth_id,
      sender_role: 'teacher',
      content,
    })
    setSending(false)
  }

  async function postAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    if (!teacher) return
    setAnnLoading(true)
    const { data } = await supabase.from('announcements').insert({
      teacher_id: teacher.id, school_id: teacher.school_id, title: annTitle, body: annBody,
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
      teacher_id: teacher.id, school_id: teacher.school_id,
      title: meetTitle, meeting_link: meetLink,
      scheduled_at: new Date(meetDate).toISOString(),
    }).select().single()
    if (data) setMeetings(prev => [...prev, data])
    setMeetTitle(''); setMeetDate('')
    setMeetLoading(false)
  }

  async function uploadReport(e: React.FormEvent) {
    e.preventDefault()
    if (!repFile || !teacher || !repParent) return
    setRepLoading(true); setRepMsg('')

    const fileName = `${repParent}/${Date.now()}_${repFile.name}`
    const { error: upErr } = await supabase.storage.from('reports').upload(fileName, repFile)
    if (upErr) { setRepMsg('Upload failed: ' + upErr.message); setRepLoading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('reports').getPublicUrl(fileName)
    const parent = parents.find(p => p.id === repParent)

    const { data: inserted } = await supabase.from('progress_reports').insert({
      teacher_id: teacher.id, parent_id: repParent,
      school_id: teacher.school_id, file_name: repFile.name,
      report_url: publicUrl, term: repTerm,
    }).select('*, parents(full_name)').single()

    if (inserted) setReports(prev => [inserted, ...prev])
    setRepMsg(`✅ Report uploaded for ${parent?.full_name}`)
    setRepFile(null)
    // Reset file input
    const fileInput = document.getElementById('report-file-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    setRepLoading(false)
  }

  async function signOut() {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="loading"><div className="spinner" />Loading your dashboard…</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.jpg" alt="Puisano360" style={{ height: '38px', width: 'auto', borderRadius: '6px', background: 'white', padding: '2px', objectFit: 'contain' }} />
          <span className="nav-logo">Puisano<span>360</span></span>
        </div>
        <div className="nav-right">
          <span className="nav-user">🏫 {teacher?.full_name}</span>
          <button onClick={signOut} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Teacher Dashboard</h1>
          <p>Manage your class communications and updates</p>
        </div>

        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon">👨‍👩‍👧</div>
            <div className="stat-num">{parents.length}</div>
            <div className="stat-label">Parents in School</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📢</div>
            <div className="stat-num">{announcements.length}</div>
            <div className="stat-label">Announcements</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-num">{reports.length}</div>
            <div className="stat-label">Reports Uploaded</div>
          </div>
        </div>

        <div className="tabs">
          {([
            { key: 'announcements', label: '📢 Post Announcement' },
            { key: 'meetings',      label: '🎥 Schedule Meeting'  },
            { key: 'reports',       label: '📊 Upload Reports'    },
            { key: 'messages',      label: '💬 Message Parents'   },
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
                <div className="empty-state"><div className="empty-icon">📢</div><p>No announcements yet.</p></div>
              ) : announcements.map(a => (
                <div key={a.id} className="announcement-item">
                  <h4>{a.title}</h4><p>{a.body}</p>
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
                  <label>Zoom Meeting Link</label>
                  <input value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="https://zoom.us/j/..." required />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>✅ Pre-filled with your Zoom link</span>
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
                <div className="empty-state"><div className="empty-icon">📅</div><p>No meetings scheduled yet.</p></div>
              ) : meetings.map(m => (
                <div key={m.id} className="meeting-card" style={{ marginBottom: '1rem' }}>
                  <h4>{m.title}</h4>
                  <div className="meeting-time">
                    {new Date(m.scheduled_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(m.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" className="join-btn">Open Zoom Link</a>
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
              {repMsg && <div className={repMsg.startsWith('Upload failed') ? 'error-msg' : 'success-msg'} style={{ marginBottom: '1rem' }}>{repMsg}</div>}
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
                    <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>PDF Report File</label>
                  <input id="report-file-input" type="file" accept=".pdf"
                    onChange={e => setRepFile(e.target.files?.[0] ?? null)} required style={{ padding: '0.5rem 0' }} />
                </div>
                <button type="submit" className="btn btn-gold" disabled={repLoading || !repFile || !repParent}>
                  {repLoading ? 'Uploading…' : '📤 Upload Report'}
                </button>
              </form>
            </div>
            <div className="card">
              <div className="section-title">Uploaded Reports</div>
              {reports.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📄</div><p>No reports uploaded yet.</p></div>
              ) : reports.map(r => (
                <div key={r.id} className="report-row">
                  <div className="report-info">
                    <strong>{r.file_name}</strong>
                    <span>{r.term} · {r.parents?.full_name} · {new Date(r.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <a href={r.report_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>View</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        {tab === 'messages' && (
          <div className="grid-2">
            {/* Parent list */}
            <div className="card">
              <div className="section-title">Parents</div>
              {parents.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">👤</div><p>No parents in your school yet.</p></div>
              ) : parents.map(p => (
                <div key={p.id} onClick={() => selectParent(p)}
                  style={{
                    padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: '0.5rem',
                    background: selectedParent?.id === p.id ? 'var(--green-pale)' : 'transparent',
                    border: `1px solid ${selectedParent?.id === p.id ? 'var(--green)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: selectedParent?.id === p.id ? 'var(--green)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedParent?.id === p.id ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
                    {p.full_name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.92rem' }}>{p.full_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.auth_id ? '🟢 Account linked' : '🔴 Not linked'}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat panel */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="section-title">
                {selectedParent ? `Chat with ${selectedParent.full_name}` : 'Select a parent'}
              </div>

              {selectedParent && !selectedParent.auth_id && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '0.85rem', fontSize: '0.88rem', color: '#856404' }}>
                  ⚠️ This parent&apos;s account is not linked yet. They need to sign up or have their auth_id set.
                </div>
              )}

              <div className="message-list" style={{ minHeight: '220px' }}>
                {messages.length === 0 && (
                  <div className="empty-state"><div className="empty-icon">💬</div><p>{selectedParent ? 'No messages yet.' : 'Select a parent to start chatting.'}</p></div>
                )}
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={`message-bubble ${m.sender_role === 'teacher' ? 'sent' : 'received'}`}>{m.content}</div>
                    <div className="message-meta" style={{ alignSelf: m.sender_role === 'teacher' ? 'flex-end' : 'flex-start' }}>
                      {m.sender_role === 'teacher' ? 'You' : selectedParent?.full_name} · {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={msgEnd} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  placeholder={selectedParent ? `Message ${selectedParent.full_name}…` : 'Select a parent first'}
                  disabled={!selectedParent || !selectedParent.auth_id}
                  onKeyDown={e => e.key === 'Enter' && !sending && sendMessage()} />
                <button onClick={sendMessage} className="btn btn-primary"
                  disabled={sending || !newMsg.trim() || !selectedParent || !selectedParent.auth_id}>
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