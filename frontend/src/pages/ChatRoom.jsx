import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ConfirmModal from '../components/ConfirmModal'

export default function ChatRoom() {
  const { requestId } = useParams()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [request, setRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [socketError, setSocketError] = useState('')
  const [endingSession, setEndingSession] = useState(false)
  const [showConfirmEnd, setShowConfirmEnd] = useState(false)
  const [ratingError, setRatingError] = useState('')

  // Rating state (for learner after session closed)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingScore, setRatingScore] = useState(5)
  const [ratingFeedback, setRatingFeedback] = useState('')
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratingSuccess, setRatingSuccess] = useState(false)

  const socketRef = useRef(null)
  const chatBottomRef = useRef(null)

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Connect authenticated Socket.io client
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setSocketError('')
      // Join private session room
      socket.emit('joinRoom', { roomId: requestId })
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('error', (err) => {
      setSocketError(err?.message || 'Chat connection error')
      setLoading(false)
    })

    // Initial message history and request session data from server
    socket.on('roomHistory', ({ request: reqData, messages: history }) => {
      setRequest(reqData)
      setMessages(history || [])
      setLoading(false)

      // If already closed and user is learner and not rated yet, show rating prompt
      const isLearner = reqData.requester?._id?.toString() === user?._id?.toString()
      if (reqData.status === 'closed' && isLearner && (reqData.rating === null || reqData.rating === undefined)) {
        setShowRatingModal(true)
      }
    })

    // Incoming messages
    socket.on('message', (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages by ID
        if (msg._id && prev.some((m) => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    // Session ended by either participant
    socket.on('sessionEnded', ({ request: updatedReq }) => {
      setRequest(updatedReq)
      const isLearner = updatedReq.requester?._id?.toString() === user?._id?.toString()
      if (isLearner && (updatedReq.rating === null || updatedReq.rating === undefined)) {
        setShowRatingModal(true)
      }
    })

    return () => {
      socket.emit('leaveRoom', { roomId: requestId })
      socket.disconnect()
    }
  }, [requestId, user, navigate])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim() || !socketRef.current || !connected) return
    if (request?.status === 'closed') return

    socketRef.current.emit('sendMessage', {
      roomId: requestId,
      text: inputText.trim()
    })
    setInputText('')
  }

  const handleConfirmEndSession = () => {
    setEndingSession(true)
    setShowConfirmEnd(false)
    if (socketRef.current) {
      socketRef.current.emit('endSession', { roomId: requestId })
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    setRatingSubmitting(true)
    setRatingError('')
    try {
      await api.post(`/api/requests/${requestId}/rate`, {
        rating: ratingScore,
        feedback: ratingFeedback
      })
      setRatingSuccess(true)
      setShowRatingModal(false)
      refreshUser()
      // Refresh request data
      const res = await api.get(`/api/requests/${requestId}`)
      setRequest(res.data)
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating')
    } finally {
      setRatingSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="ss-loading" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="mt-2 text-secondary">Connecting to secure session room...</span>
      </div>
    )
  }

  if (socketError) {
    return (
      <div className="container py-5" style={{ maxWidth: '600px' }}>
        <div className="ss-card text-center p-5 border-danger">
          <div className="fs-1 mb-2">🚫</div>
          <h4 className="fw-bold text-danger mb-2">Access Restricted</h4>
          <p className="text-secondary mb-4">{socketError}</p>
          <RouterLink to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </RouterLink>
        </div>
      </div>
    )
  }

  const isLearner = request?.requester?._id?.toString() === user?._id?.toString()
  const helperName = request?.helper?.name || 'Helper'
  const learnerName = request?.requester?.name || 'Learner'
  const isClosed = request?.status === 'closed'

  return (
    <div className="container py-3" style={{ maxWidth: '960px' }}>
      {/* Session Header Card */}
      <div className="ss-card p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span className="ss-skill-tag">{request?.skill}</span>
              <span className={`ss-badge ${isClosed ? 'ss-badge-secondary' : 'ss-badge-success'}`}>
                {isClosed ? 'Closed' : '● Live Session'}
              </span>
              <span className="d-inline-flex align-items-center gap-1 text-secondary" style={{ fontSize: '0.75rem' }}>
                <span className={`ss-status-dot ${connected ? 'online' : 'offline'}`}></span>
                {connected ? 'Connected' : 'Reconnecting...'}
              </span>
            </div>
            <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
              Learner: <strong>{learnerName}</strong> · Helper: <strong>{helperName}</strong>
            </div>
            <div className="text-muted mt-1 text-truncate" style={{ fontSize: '0.75rem', maxWidth: '600px' }}>
              <i className="bi bi-info-circle me-1"></i>Goal: {request?.description}
            </div>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {!isClosed && isLearner && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => setShowConfirmEnd(true)}
                disabled={endingSession}
                title="Only the learner can conclude this session"
              >
                {endingSession ? (
                  <><span className="spinner-border spinner-border-sm me-1"></span>Ending...</>
                ) : (
                  <><i className="bi bi-x-circle me-1"></i>End Session</>
                )}
              </button>
            )}
            <RouterLink to="/dashboard" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-speedometer2 me-1"></i>Dashboard
            </RouterLink>
          </div>
        </div>
      </div>

      {/* Closed / Rating Notification Banner */}
      {isClosed && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2 py-2 px-3 mb-3" style={{ borderRadius: 10, fontSize: '0.875rem' }}>
          <div>
            <div className="fw-bold"><i className="bi bi-check-circle-fill me-1 text-success"></i>Session Concluded</div>
            <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
              This exchange is closed. Participants have earned reputation experience.
            </div>
          </div>
          {isLearner && !request?.rating && !ratingSuccess && (
            <button
              className="btn btn-sm fw-bold"
              style={{ background: 'var(--ss-warning)', color: 'white' }}
              onClick={() => setShowRatingModal(true)}
            >
              ★ Rate Helper
            </button>
          )}
          {request?.rating && (
            <span className="badge bg-warning text-dark">⭐ Rated {request.rating}/5</span>
          )}
        </div>
      )}

      {/* Main Chat Container */}
      <div className="ss-chat-container">
        {/* Messages Scroll Area */}
        <div className="ss-chat-messages">
          {messages.length === 0 ? (
            <div className="m-auto text-center text-muted">
              <div className="fs-1 mb-2">👋</div>
              <p className="mb-0" style={{ fontSize: '0.875rem' }}>Room connected! Send a message to start sharing skills.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              if (msg.system) {
                return (
                  <div key={msg._id || index} className="ss-msg-bubble system">
                    {msg.text}
                  </div>
                )
              }

              const isMe = msg.sender?.toString() === user?._id?.toString() || msg.username === user?.name

              return (
                <div
                  key={msg._id || index}
                  className={`ss-msg-bubble ${isMe ? 'sent' : 'received'}`}
                >
                  <div className="d-flex justify-content-between align-items-center gap-3 mb-1">
                    <span className="fw-bold" style={{ fontSize: '0.7rem', opacity: isMe ? 0.9 : 0.7 }}>
                      {isMe ? 'You' : msg.username}
                    </span>
                    <span className={`ss-msg-meta ${isMe ? '' : 'received'}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              )
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Fixed Message Composer Footer */}
        <div className="ss-chat-footer">
          {isClosed ? (
            <div className="p-2 text-center text-muted" style={{ fontSize: '0.8125rem' }}>
              <i className="bi bi-lock me-1"></i>This session has ended. New messages are disabled.
            </div>
          ) : (
            <form onSubmit={handleSendMessage}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your message to exchange knowledge..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  autoFocus
                  disabled={!connected}
                />
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={!inputText.trim() || !connected}
                >
                  <i className="bi bi-send-fill me-1"></i>Send
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal: Rating & Feedback */}
      {showRatingModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Rate Your Helper</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRatingModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitRating}>
                <div className="modal-body">
                  <p className="text-secondary mb-3" style={{ fontSize: '0.875rem' }}>
                    Help <strong>{helperName}</strong> grow their reputation by providing a fair rating for this session.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Star Rating (1 to 5 Stars) <span className="text-danger">*</span></label>
                    <div className="d-flex justify-content-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
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

                  {ratingError && (
                    <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: 8 }}>
                      {ratingError}
                    </div>
                  )}

                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <label className="form-label mb-0">Feedback <span className="text-muted fw-normal">(optional)</span></label>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{ratingFeedback.length}/500</span>
                    </div>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe how the helper assisted you or what was most valuable..."
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value.slice(0, 500))}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowRatingModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm fw-bold"
                    style={{ background: 'var(--ss-warning)', color: 'white' }}
                    disabled={ratingSubmitting}
                  >
                    {ratingSubmitting ? (
                      <><span className="spinner-border spinner-border-sm me-1"></span>Submitting...</>
                    ) : (
                      '★ Submit Rating'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inbuilt Component: Confirm Ending Session */}
      <ConfirmModal
        isOpen={showConfirmEnd}
        title="Conclude Learning Session?"
        message={`Are you sure you want to end and conclude this session for "${request?.skill}"? The chat exchange will close and you will be invited to rate your helper.`}
        confirmText="Yes, End Session"
        confirmVariant="danger"
        icon="bi-x-circle-fill"
        loading={endingSession}
        onConfirm={handleConfirmEndSession}
        onCancel={() => setShowConfirmEnd(false)}
      />

    </div>
  )
}