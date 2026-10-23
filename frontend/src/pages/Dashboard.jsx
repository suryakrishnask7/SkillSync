import React, { useState, useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { io } from 'socket.io-client'
import ConfirmModal from '../components/ConfirmModal'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ learningSessions: [], helpingSessions: [] })
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // In-app Confirm Delete Modal
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Create Request Modal State (Controlled via React State)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingSession, setRatingSession] = useState(null)
  const [ratingScore, setRatingScore] = useState(5)
  const [ratingFeedback, setRatingFeedback] = useState('')
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState('')

  const fetchData = async () => {
    try {
      const res = await api.get('/api/requests/my')
      setData(res.data || { learningSessions: [], helpingSessions: [] })
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    refreshUser()
    const token = localStorage.getItem('token')
    if (!token) return
    const socket = io(SOCKET_URL, { auth: { token } })
    socket.on('requestAccepted', (payload) => {
      setNotification(payload.message || 'Your help request was accepted!')
      fetchData()
    })
    return () => socket.disconnect()
  }, [])

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTarget) return
    setDeleteLoading(true)
    setErrorMsg('')
    try {
      await api.delete(`/api/requests/${confirmDeleteTarget._id}`)
      setConfirmDeleteTarget(null)
      setSuccessMsg('Request deleted successfully.')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchData()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not delete request')
      setConfirmDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    if (!newSkill.trim() || !newDesc.trim()) {
      setCreateError('Both skill and description are required.')
      return
    }
    setCreateLoading(true)
    setCreateError('')
    try {
      await api.post('/api/requests', {
        skill: newSkill.trim(),
        description: newDesc.trim()
      })
      setNewSkill('')
      setNewDesc('')
      setShowCreateModal(false)
      setSuccessMsg('Help request posted successfully! It is now live in the community browse list.')
      setTimeout(() => setSuccessMsg(''), 5000)
      fetchData()
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create request')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleRateHelper = async (e) => {
    e.preventDefault()
    if (!ratingSession) return
    setRatingLoading(true)
    try {
      await api.post(`/api/requests/${ratingSession._id}/rate`, {
        rating: ratingScore,
        feedback: ratingFeedback
      })
      setRatingSession(null)
      setRatingFeedback('')
      setShowRatingModal(false)
      setSuccessMsg('Thank you! Your rating has been submitted.')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchData()
      refreshUser()
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating')
    } finally {
      setRatingLoading(false)
    }
  }

  const openRatingModal = (session) => {
    setRatingSession(session)
    setRatingScore(5)
    setRatingFeedback('')
    setShowRatingModal(true)
  }

  const openCreateModal = () => {
    setNewSkill('')
    setNewDesc('')
    setCreateError('')
    setShowCreateModal(true)
  }

  if (loading) {
    return (
      <div className="ss-loading" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span>Loading your dashboard...</span>
      </div>
    )
  }

  const learningSessions = data.learningSessions || []
  const helpingSessions = data.helpingSessions || []

  const activeLearning = learningSessions.filter(s => s.status !== 'closed')
  const closedLearning = learningSessions.filter(s => s.status === 'closed')
  const activeHelping = helpingSessions.filter(s => s.status === 'accepted' || s.status === 'in-progress')
  const closedHelping = helpingSessions.filter(s => s.status === 'closed')
  const unrated = closedLearning.filter(s => s.helper && !s.rating)

  return (
    <div className="container py-4">

      {/* Notification Banner */}
      {notification && (
        <div className="ss-alert-notification mb-4">
          <span><i className="bi bi-bell-fill text-primary me-2"></i>{notification}</span>
          <button className="btn btn-sm btn-link p-0 text-secondary" onClick={() => setNotification('')}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="ss-alert-notification mb-4">
          <span><i className="bi bi-check-circle-fill text-success me-2"></i>{successMsg}</span>
          <button className="btn btn-sm btn-link p-0 text-secondary" onClick={() => setSuccessMsg('')}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="alert alert-danger d-flex gap-2 align-items-center py-2 mb-4" style={{ fontSize: '0.875rem', borderRadius: 8 }}>
          <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>{errorMsg}
          <button className="btn btn-sm btn-link ms-auto p-0 text-danger" onClick={() => setErrorMsg('')}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* Rating Reminder */}
      {unrated.length > 0 && (
        <div className="alert mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 px-3" style={{ background: 'var(--ss-warning-subtle)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, fontSize: '0.875rem' }}>
          <span><i className="bi bi-star-fill text-warning me-2"></i><strong>Rate your helpers</strong> · {unrated.length} session{unrated.length > 1 ? 's' : ''} awaiting feedback</span>
          <div className="d-flex flex-wrap gap-2">
            {unrated.map(s => (
              <button key={s._id} className="btn btn-sm" onClick={() => openRatingModal(s)} style={{ background: 'var(--ss-warning)', color: 'white', fontWeight: 600, fontSize: 12 }}>
                Rate {s.helper?.name} for {s.skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>Track your learning sessions, requests, and community milestones.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="bi bi-plus-lg me-2"></i>New Help Request
        </button>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'bi-star-fill', label: 'Reputation', value: user?.reputation || 100, color: 'var(--ss-warning)', bg: 'var(--ss-warning-subtle)' },
          { icon: 'bi-award-fill', label: `Level ${user?.level || 1}`, value: `${user?.xp || 0} XP`, color: 'var(--ss-primary)', bg: 'var(--ss-primary-subtle)' },
          { icon: 'bi-lightning-charge-fill', label: 'Helping Streak', value: `${user?.streaks?.helpingStreak || 0}d`, color: 'var(--ss-success)', bg: 'var(--ss-success-subtle)' },
          { icon: 'bi-check2-circle', label: 'Sessions Helped', value: user?.stats?.sessionsHelped || 0, color: 'var(--ss-accent)', bg: 'var(--ss-accent-subtle)' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="ss-stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}><i className={`bi ${s.icon}`}></i></div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color, fontSize: '1.4rem' }}>{s.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Learning Requests */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0">My Learning Requests <span className="badge ms-1 rounded-pill" style={{ background: 'var(--ss-primary-subtle)', color: 'var(--ss-primary)', fontSize: 12 }}>{activeLearning.length}</span></h5>
            <button className="btn btn-sm btn-outline-primary" onClick={openCreateModal}>+ New</button>
          </div>

          {activeLearning.length === 0 ? (
            <div className="ss-empty ss-card">
              <div className="ss-empty-icon">📝</div>
              <h6 className="fw-bold">No Active Requests</h6>
              <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>Post a help request and get matched with a peer helper.</p>
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>Ask for Help</button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {activeLearning.map(req => (
                <div key={req._id} className="ss-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-0">{req.skill}</h6>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Posted {new Date(req.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`ss-badge ${req.status === 'open' ? 'ss-badge-warning' : 'ss-badge-success'}`}>
                      {req.status === 'open' ? '○ Open' : '● In Session (Accepted)'}
                    </span>
                  </div>
                  <p className="text-secondary mb-3" style={{ fontSize: '0.8125rem' }}>{req.description}</p>

                  {(req.status === 'accepted' || req.status === 'in-progress') && req.helper && (
                    <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded" style={{ background: 'var(--ss-success-subtle)', fontSize: '0.8rem' }}>
                      <span className="ss-avatar ss-avatar-sm">{req.helper.name?.charAt(0)}</span>
                      <span><strong>{req.helper.name}</strong> accepted & helping you</span>
                    </div>
                  )}

                  <div className="d-flex gap-2 justify-content-end">
                    {req.status === 'open' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmDeleteTarget(req)}>
                        <i className="bi bi-trash me-1"></i>Delete
                      </button>
                    )}
                    {(req.status === 'accepted' || req.status === 'in-progress') && (
                      <RouterLink to={`/chat/${req._id}`} className="btn btn-sm btn-primary">
                        <i className="bi bi-chat-dots me-1"></i>Enter Chat
                      </RouterLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Closed Learning */}
          {closedLearning.length > 0 && (
            <div className="mt-4">
              <h6 className="text-secondary fw-semibold mb-2" style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completed Sessions ({closedLearning.length})</h6>
              <div className="d-flex flex-column gap-2">
                {closedLearning.slice(0, 5).map(req => (
                  <div key={req._id} className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: 'var(--ss-surface)', border: '1px solid var(--ss-border)', fontSize: '0.8125rem' }}>
                    <div>
                      <div className="fw-semibold">{req.skill}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Helper: {req.helper?.name || '—'}</div>
                    </div>
                    {req.rating ? (
                      <span className="ss-badge ss-badge-warning">★ Rated {req.rating}/5</span>
                    ) : (
                      <button className="btn btn-sm" onClick={() => openRatingModal(req)} style={{ background: 'var(--ss-warning)', color: 'white', fontSize: 12, fontWeight: 600, padding: '0.2rem 0.6rem' }}>
                        Rate Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Helping Sessions */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0">Sessions I'm Helping <span className="badge ms-1 rounded-pill" style={{ background: 'var(--ss-accent-subtle)', color: 'var(--ss-accent)', fontSize: 12 }}>{activeHelping.length}</span></h5>
            <RouterLink to="/requests" className="btn btn-sm btn-outline-secondary">Browse Requests</RouterLink>
          </div>

          {activeHelping.length === 0 ? (
            <div className="ss-empty ss-card">
              <div className="ss-empty-icon">🤝</div>
              <h6 className="fw-bold">Not Helping Anyone Yet</h6>
              <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>Browse open requests and accept one to start a session.</p>
              <RouterLink to="/requests" className="btn btn-sm btn-outline-primary">Find Requests</RouterLink>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {activeHelping.map(req => (
                <div key={req._id} className="ss-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-0">{req.skill}</h6>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Learner: {req.requester?.name || 'Peer'}</div>
                    </div>
                    <span className="ss-badge ss-badge-info">● Active</span>
                  </div>
                  <p className="text-secondary mb-3" style={{ fontSize: '0.8125rem' }}>{req.description}</p>
                  <div className="d-flex justify-content-end">
                    <RouterLink to={`/chat/${req._id}`} className="btn btn-sm" style={{ background: 'var(--ss-accent)', color: 'white', fontWeight: 600 }}>
                      <i className="bi bi-chat-dots me-1"></i>Enter Chat
                    </RouterLink>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Closed Helping */}
          {closedHelping.length > 0 && (
            <div className="mt-4">
              <h6 className="text-secondary fw-semibold mb-2" style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Past Sessions ({closedHelping.length})</h6>
              <div className="d-flex flex-column gap-2">
                {closedHelping.slice(0, 5).map(req => (
                  <div key={req._id} className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: 'var(--ss-surface)', border: '1px solid var(--ss-border)', fontSize: '0.8125rem' }}>
                    <div>
                      <div className="fw-semibold">{req.skill}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Learner: {req.requester?.name || '—'}</div>
                    </div>
                    {req.rating ? (
                      <span className="ss-badge ss-badge-warning">★ {req.rating}/5</span>
                    ) : (
                      <span className="ss-badge ss-badge-secondary">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges Row */}
      {user?.badges?.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Recent Badges</h5>
          <div className="d-flex flex-wrap gap-3">
            {user.badges.slice(0, 6).map(b => (
              <div key={b.id} className="ss-achievement unlocked" style={{ minWidth: 100 }}>
                <div className="ss-achievement-icon">{b.icon}</div>
                <div className="fw-semibold mt-1" style={{ fontSize: '0.75rem', color: 'var(--ss-primary)' }}>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Request (Pure React Controlled) */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">New Help Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateRequest}>
                <div className="modal-body">
                  <p className="text-secondary mb-4" style={{ fontSize: '0.875rem' }}>
                    Describe what you need help with. A peer helper will accept your request and start a live chat.
                  </p>
                  {createError && (
                    <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: 8 }}>{createError}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="modal-skill">Skill Needed <span className="text-danger">*</span></label>
                    <input
                      id="modal-skill"
                      type="text"
                      className="form-control"
                      placeholder="e.g. React State Management, Git Branching, Docker"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-1">
                    <div className="d-flex justify-content-between mb-1">
                      <label className="form-label mb-0" htmlFor="modal-desc">Description <span className="text-danger">*</span></label>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{newDesc.length}/1000</span>
                    </div>
                    <textarea
                      id="modal-desc"
                      className="form-control"
                      rows={4}
                      placeholder="Be specific about your challenge, current blockers, and what outcome you want..."
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value.slice(0, 1000))}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={createLoading}>
                    {createLoading ? <><span className="spinner-border spinner-border-sm me-1"></span>Posting...</> : 'Post Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rate Helper (Pure React Controlled) */}
      {showRatingModal && ratingSession && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Rate Your Helper</h5>
                <button type="button" className="btn-close" onClick={() => setShowRatingModal(false)}></button>
              </div>
              <form onSubmit={handleRateHelper}>
                <div className="modal-body">
                  <p className="text-secondary mb-4" style={{ fontSize: '0.875rem' }}>
                    How was your session with <strong>{ratingSession.helper?.name}</strong> for <strong>{ratingSession.skill}</strong>?
                  </p>
                  <div className="mb-4">
                    <label className="form-label">Star Rating <span className="text-danger">*</span></label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`ss-star-btn ${ratingScore >= star ? 'active' : ''}`}
                          onClick={() => setRatingScore(star)}
                        >
                          ★ {star}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-1">
                    <div className="d-flex justify-content-between mb-1">
                      <label className="form-label mb-0">Feedback <span className="text-muted fw-normal">(optional)</span></label>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{ratingFeedback.length}/500</span>
                    </div>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Share what went well or how the session helped you..."
                      value={ratingFeedback}
                      onChange={e => setRatingFeedback(e.target.value.slice(0, 500))}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowRatingModal(false)}>Later</button>
                  <button type="submit" className="btn btn-sm fw-bold" disabled={ratingLoading} style={{ background: 'var(--ss-warning)', color: 'white' }}>
                    {ratingLoading ? <><span className="spinner-border spinner-border-sm me-1"></span>Submitting...</> : '★ Submit Rating'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inbuilt Component: Confirm Delete Request Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteTarget)}
        title="Delete Help Request?"
        message={`Are you sure you want to remove your open request for "${confirmDeleteTarget?.skill}"? This action cannot be undone.`}
        confirmText="Yes, Delete Request"
        confirmVariant="danger"
        icon="bi-trash3-fill"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteTarget(null)}
      />

    </div>
  )
}
