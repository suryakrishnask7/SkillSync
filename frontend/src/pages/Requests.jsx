import React, { useState, useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ConfirmModal from '../components/ConfirmModal'

export default function Requests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [search, setSearch] = useState('')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  // In-app Confirm Modals (replacing browser confirm/alert)
  const [confirmAcceptTarget, setConfirmAcceptTarget] = useState(null)
  const [acceptingLoading, setAcceptingLoading] = useState(false)

  const [confirmCloseTarget, setConfirmCloseTarget] = useState(null)
  const [closingLoading, setClosingLoading] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      // By default fetch open requests awaiting helpers
      const res = await api.get('/api/requests?status=open')
      setRequests(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError('Failed to load open requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // In-app Confirm Accept
  const handleConfirmAccept = async () => {
    if (!confirmAcceptTarget) return
    setAcceptingLoading(true)
    setError('')
    try {
      const res = await api.put(`/api/requests/${confirmAcceptTarget._id}/accept`)
      const updatedReq = res.data.request || confirmAcceptTarget
      setConfirmAcceptTarget(null)
      setSuccessMsg(`You accepted the request for "${updatedReq.skill}"! Entering session...`)
      // Refresh list: the accepted request is automatically removed from open requests
      await fetchRequests()
      // Directly navigate helper into the active chat
      navigate(`/chat/${updatedReq._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not accept this request.')
      setConfirmAcceptTarget(null)
    } finally {
      setAcceptingLoading(false)
    }
  }

  // In-app Confirm Close
  const handleConfirmClose = async () => {
    if (!confirmCloseTarget) return
    setClosingLoading(true)
    setError('')
    try {
      await api.put(`/api/requests/${confirmCloseTarget._id}/close`)
      setConfirmCloseTarget(null)
      setSuccessMsg('Session closed successfully.')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchRequests()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not close session.')
      setConfirmCloseTarget(null)
    } finally {
      setClosingLoading(false)
    }
  }

  // Create Request
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
      setSuccessMsg('Your help request was posted successfully! It is now live in the community list.')
      setTimeout(() => setSuccessMsg(''), 5000)
      fetchRequests()
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create request')
    } finally {
      setCreateLoading(false)
    }
  }

  const safeRequests = Array.isArray(requests) ? requests : []
  const filtered = safeRequests.filter(r =>
    r.skill?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container py-4">

      {/* Success Notification */}
      {successMsg && (
        <div className="ss-alert-notification mb-4">
          <span><i className="bi bi-check-circle-fill text-success me-2"></i>{successMsg}</span>
          <button className="btn btn-sm btn-link p-0 text-secondary" onClick={() => setSuccessMsg('')}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="alert alert-danger d-flex gap-2 align-items-center py-2 mb-4" style={{ fontSize: '0.875rem', borderRadius: 8 }}>
          <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>{error}
          <button className="btn btn-sm btn-link ms-auto p-0 text-danger" onClick={() => setError('')}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Browse Skill Requests</h1>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
            Find peers who need guidance. Accept a request to begin a live 1-on-1 session.
          </p>
        </div>
        <div>
          {user ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setNewSkill('')
                setNewDesc('')
                setCreateError('')
                setShowCreateModal(true)
              }}
            >
              <i className="bi bi-plus-lg me-1"></i>Post a Request
            </button>
          ) : (
            <RouterLink to="/login" className="btn btn-primary">
              <i className="bi bi-box-arrow-in-right me-1"></i>Sign in to Post
            </RouterLink>
          )}
        </div>
      </div>

      {/* Search Bar & Result Counter (Filters removed cleanly) */}
      <div className="row g-2 mb-4 align-items-center">
        <div className="col-md-6 col-lg-5">
          <div className="input-group">
            <span className="input-group-text border-end-0" style={{ background: 'white', border: '1px solid var(--ss-border)' }}>
              <i className="bi bi-search text-secondary"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by skill or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-auto ms-auto">
          <span className="text-secondary" style={{ fontSize: '0.8125rem' }}>
            <strong>{filtered.length}</strong> open request{filtered.length !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="ss-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading requests...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ss-empty">
          <div className="ss-empty-icon">📭</div>
          <h5 className="fw-bold">No open requests found</h5>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            {search ? 'Try a different search keyword.' : 'All community requests are currently being helped! Post a request if you need guidance.'}
          </p>
          <div className="d-flex gap-2 justify-content-center mt-3">
            {search && (
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSearch('')}>
                Clear Search
              </button>
            )}
            {user && (
              <button className="btn btn-sm btn-primary" onClick={() => setShowCreateModal(true)}>
                Post a Help Request
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(req => {
            const isRequester = user?._id?.toString() === req.requester?._id?.toString()
            const isHelper = user?._id?.toString() === req.helper?._id?.toString()
            const isOpen = req.status === 'open'
            const isAccepted = req.status === 'accepted' || req.status === 'in-progress'

            return (
              <div key={req._id} className="col-md-6 col-lg-4">
                <div className="ss-request-card">
                  {/* Skill Tag & Status */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="ss-skill-tag">{req.skill}</span>
                    <span className={`ss-badge ${isOpen ? 'ss-badge-warning' : isAccepted ? 'ss-badge-success' : 'ss-badge-secondary'}`}>
                      {isOpen ? '○ Open' : isAccepted ? '● In Session' : '✓ Closed'}
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    className="text-secondary mt-2 mb-3 flex-grow-1"
                    style={{
                      fontSize: '0.8125rem',
                      lineHeight: 1.6,
                      WebkitLineClamp: 3,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {req.description}
                  </p>

                  {/* Requester Info & Profile */}
                  <div className="d-flex align-items-center gap-2 py-2 border-top border-bottom mb-3" style={{ borderColor: 'var(--ss-border)' }}>
                    <span className="ss-avatar ss-avatar-sm">
                      {req.requester?.name?.charAt(0) || '?'}
                    </span>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold text-truncate" style={{ fontSize: '0.8125rem', color: 'var(--ss-text)' }}>
                        {req.requester?.name || 'Community Member'}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                        {' · '}
                        <span className="text-warning fw-semibold">★ {req.requester?.reputation || 100}</span>
                      </div>
                    </div>
                    {req.requester?._id && (
                      <RouterLink
                        to={`/profile/${req.requester._id}`}
                        className="btn btn-sm btn-light border py-1 px-2"
                        title="View Profile"
                        style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ss-text-secondary)', borderRadius: '6px' }}
                      >
                        <i className="bi bi-person me-1"></i>Profile
                      </RouterLink>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2 justify-content-end mt-auto align-items-center flex-wrap">
                    {/* Helper Can Accept Request via In-app Confirm Modal */}
                    {isOpen && user && !isRequester && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setConfirmAcceptTarget(req)}
                      >
                        <i className="bi bi-hand-thumbs-up me-1"></i>Accept Request
                      </button>
                    )}

                    {/* Requester Own Request Indicator */}
                    {isOpen && isRequester && (
                      <span className="badge bg-light text-muted py-2 px-3 border" style={{ fontSize: 12 }}>
                        Your Request (Waiting for peer)
                      </span>
                    )}

                    {/* In-Session: Chat and Requester-only End Session */}
                    {(isHelper || isRequester) && isAccepted && (
                      <>
                        {isRequester && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => setConfirmCloseTarget(req)}
                            title="Only the learner can close this session"
                          >
                            <i className="bi bi-x-circle me-1"></i>End Session
                          </button>
                        )}
                        <RouterLink
                          to={`/chat/${req._id}`}
                          className="btn btn-sm"
                          style={{ background: 'var(--ss-accent)', color: 'white', fontWeight: 600 }}
                        >
                          <i className="bi bi-chat-dots me-1"></i>Chat
                        </RouterLink>
                      </>
                    )}

                    {/* Unauthenticated User */}
                    {!user && isOpen && (
                      <RouterLink to="/login" className="btn btn-outline-primary btn-sm">
                        Sign in to Help
                      </RouterLink>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Inbuilt Component: Confirm Accepting Request */}
      <ConfirmModal
        isOpen={Boolean(confirmAcceptTarget)}
        title="Accept Help Request?"
        message={`Are you ready to help with "${confirmAcceptTarget?.skill}"? You will become the assigned mentor and enter a live 1-on-1 private chat session.`}
        confirmText="Accept & Start Chat"
        confirmVariant="success"
        icon="bi-hand-thumbs-up-fill"
        loading={acceptingLoading}
        onConfirm={handleConfirmAccept}
        onCancel={() => setConfirmAcceptTarget(null)}
      />

      {/* Inbuilt Component: Confirm Ending Session */}
      <ConfirmModal
        isOpen={Boolean(confirmCloseTarget)}
        title="Conclude Learning Session?"
        message={`Are you sure you want to end the session for "${confirmCloseTarget?.skill}"? Both you and your helper will receive reputation points.`}
        confirmText="Yes, End Session"
        confirmVariant="danger"
        icon="bi-x-circle-fill"
        loading={closingLoading}
        onConfirm={handleConfirmClose}
        onCancel={() => setConfirmCloseTarget(null)}
      />

      {/* Modal: Create Request */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold">Post a Help Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateRequest}>
                <div className="modal-body p-4">
                  <p className="text-secondary mb-3" style={{ fontSize: '0.875rem' }}>
                    Describe the skill or problem you need help with. Community members will see this and can accept to start a live exchange.
                  </p>
                  {createError && (
                    <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: 8 }}>
                      {createError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="modal-skill">Skill Needed <span className="text-danger">*</span></label>
                    <input
                      id="modal-skill"
                      type="text"
                      className="form-control"
                      placeholder="e.g. React Hooks, Docker Compose, Git Rebase"
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
                      placeholder="Explain your problem, what you tried, and what you want help achieving..."
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value.slice(0, 1000))}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4" disabled={createLoading}>
                    {createLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>Posting...
                      </>
                    ) : (
                      'Post Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}