import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ALL_BADGES = [
  { id: 'first_help', icon: '🌟', name: 'First Helper' },
  { id: 'five_helps', icon: '🔥', name: '5 Sessions' },
  { id: 'ten_helps', icon: '💪', name: '10 Sessions' },
  { id: 'twenty_five_helps', icon: '🏆', name: '25 Sessions' },
  { id: 'fifty_helps', icon: '👑', name: '50 Sessions' },
  { id: 'top_rated', icon: '⭐', name: 'Top Rated' },
  { id: 'perfect_score', icon: '💯', name: 'Perfect Score' },
  { id: 'streak_3', icon: '⚡', name: '3-Day Streak' },
  { id: 'streak_7', icon: '🌊', name: '7-Day Streak' },
  { id: 'streak_30', icon: '🔮', name: '30-Day Streak' },
  { id: 'early_bird', icon: '🐦', name: 'Early Adopter' },
]

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', skillsToTeach: '', skillsToLearn: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skillsToTeach: (user.skillsToTeach || []).join(', '),
        skillsToLearn: (user.skillsToLearn || []).join(', ')
      })
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.put('/api/users/profile', {
        name: form.name.trim(),
        bio: form.bio.trim(),
        skillsToTeach: form.skillsToTeach.split(',').map(s => s.trim()).filter(Boolean),
        skillsToLearn: form.skillsToLearn.split(',').map(s => s.trim()).filter(Boolean)
      })
      await refreshUser()
      setEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return (
    <div className="ss-loading" style={{ minHeight: '50vh' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  )

  const earnedBadgeIds = new Set((user.badges || []).map(b => b.id))

  return (
    <div className="container py-4" style={{ maxWidth: 820 }}>

      {success && (
        <div className="ss-alert-notification mb-4">
          <span><i className="bi bi-check-circle-fill text-success me-2"></i>{success}</span>
          <button className="btn btn-sm btn-link p-0 text-secondary" onClick={() => setSuccess('')}><i className="bi bi-x-lg"></i></button>
        </div>
      )}

      {/* Profile Banner */}
      <div className="ss-profile-banner mb-5">
        <div className="ss-profile-avatar-wrap">
          <span className="ss-avatar ss-avatar-xl" style={{ border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            {user.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start ps-1 mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{user.name}</h2>
          <div className="d-flex align-items-center gap-3 flex-wrap text-secondary" style={{ fontSize: '0.8125rem' }}>
            <span><i className="bi bi-envelope me-1"></i>{user.email}</span>
            <span><i className="bi bi-award text-primary me-1"></i>Level {user.level || 1}</span>
            <span><i className="bi bi-star-fill text-warning me-1"></i>{user.reputation || 100} Rep</span>
          </div>
        </div>
        {!editing && (
          <button className="btn btn-outline-primary btn-sm" onClick={() => setEditing(true)}>
            <i className="bi bi-pencil me-1"></i>Edit Profile
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'bi-star-fill', label: 'Reputation', value: user.reputation || 100, color: 'var(--ss-warning)', bg: 'var(--ss-warning-subtle)' },
          { icon: 'bi-check2-circle', label: 'Helped', value: user.stats?.sessionsHelped || 0, color: 'var(--ss-success)', bg: 'var(--ss-success-subtle)' },
          { icon: 'bi-book', label: 'Learned', value: user.stats?.sessionsLearned || 0, color: 'var(--ss-primary)', bg: 'var(--ss-primary-subtle)' },
          { icon: 'bi-lightning-charge', label: 'Streak', value: `${user.streaks?.helpingStreak || 0}d`, color: 'var(--ss-accent)', bg: 'var(--ss-accent-subtle)' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="ss-stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}><i className={`bi ${s.icon}`}></i></div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color, fontSize: '1.35rem' }}>{s.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      {editing ? (
        <div className="ss-card p-4 mb-4">
          <div className="ss-card-header px-0 pt-0 mb-4">
            <i className="bi bi-pencil-square text-primary me-2"></i>Edit Your Profile
          </div>
          {error && (
            <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.875rem', borderRadius: 8 }}>{error}</div>
          )}
          <form onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="edit-name">Display Name</label>
                <input
                  id="edit-name"
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="edit-bio">Bio <span className="text-muted fw-normal">({form.bio.length}/500)</span></label>
                <textarea
                  id="edit-bio"
                  className="form-control"
                  rows={3}
                  placeholder="Tell the community what you're about..."
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value.slice(0, 500) })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="edit-teach">Skills I Can Teach <span className="text-muted fw-normal">(comma-separated)</span></label>
                <input
                  id="edit-teach"
                  type="text"
                  className="form-control"
                  placeholder="JavaScript, Python, Figma"
                  value={form.skillsToTeach}
                  onChange={e => setForm({ ...form, skillsToTeach: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="edit-learn">Skills I Want to Learn <span className="text-muted fw-normal">(comma-separated)</span></label>
                <input
                  id="edit-learn"
                  type="text"
                  className="form-control"
                  placeholder="TypeScript, Rust, ML"
                  value={form.skillsToLearn}
                  onChange={e => setForm({ ...form, skillsToLearn: e.target.value })}
                />
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Mode */
        <div className="row g-3 mb-4">
          {user.bio && (
            <div className="col-12">
              <div className="ss-card p-4">
                <div className="ss-card-header px-0 pt-0 mb-2"><i className="bi bi-person-lines-fill text-primary me-2"></i>About</div>
                <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--ss-text-secondary)' }}>{user.bio}</p>
              </div>
            </div>
          )}
          {user.skillsToTeach?.length > 0 && (
            <div className="col-md-6">
              <div className="ss-card p-4">
                <div className="ss-card-header px-0 pt-0 mb-3"><i className="bi bi-mortarboard-fill text-success me-2"></i>Can Teach</div>
                <div className="d-flex flex-wrap gap-2">
                  {user.skillsToTeach.map((s, i) => <span key={i} className="ss-skill-tag">{s}</span>)}
                </div>
              </div>
            </div>
          )}
          {user.skillsToLearn?.length > 0 && (
            <div className="col-md-6">
              <div className="ss-card p-4">
                <div className="ss-card-header px-0 pt-0 mb-3"><i className="bi bi-book-fill text-primary me-2"></i>Want to Learn</div>
                <div className="d-flex flex-wrap gap-2">
                  {user.skillsToLearn.map((s, i) => <span key={i} className="ss-badge ss-badge-secondary">{s}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      <div className="ss-card p-4">
        <div className="ss-card-header px-0 pt-0 mb-4">
          <i className="bi bi-patch-check-fill text-warning me-2"></i>Achievement Badges
          <span className="ms-2 ss-badge ss-badge-warning">{earnedBadgeIds.size}/{ALL_BADGES.length}</span>
        </div>
        <div className="row g-2">
          {ALL_BADGES.map(b => {
            const earned = earnedBadgeIds.has(b.id)
            return (
              <div key={b.id} className="col-4 col-sm-3 col-md-2">
                <div className={`ss-achievement ${earned ? 'unlocked' : 'locked'}`}>
                  <div className="ss-achievement-icon">{b.icon}</div>
                  <div className="fw-semibold mt-1" style={{ fontSize: '0.7rem', color: earned ? 'var(--ss-primary)' : 'var(--ss-text-muted)' }}>{b.name}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}