import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import api from '../services/api'

export default function Directory() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await api.get('/api/users')
        const userList = Array.isArray(res.data) ? res.data : (res.data?.users || [])
        setUsers(userList)
      } catch (err) {
        setError('Failed to load helpers directory.')
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const safeUsers = Array.isArray(users) ? users : []
  const filtered = safeUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.skillsToTeach?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    u.bio?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Helpers Directory</h1>
          <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>Find expert community members by name or skill.</p>
        </div>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text border-end-0" style={{ background: 'white', border: '1px solid var(--ss-border)' }}>
            <i className="bi bi-search text-secondary"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search name or skill..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 mb-4" style={{ fontSize: '0.875rem', borderRadius: 8 }}>{error}</div>
      )}

      {loading ? (
        <div className="ss-loading">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          <span>Loading helpers...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ss-empty">
          <div className="ss-empty-icon">👤</div>
          <h5 className="fw-bold">No helpers found</h5>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            {search ? 'Try a different name or skill.' : 'No members have listed skills yet.'}
          </p>
          {search && (
            <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setSearch('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-secondary mb-3" style={{ fontSize: '0.8125rem' }}>
            <strong>{filtered.length}</strong> helper{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="row g-3">
            {filtered.map(u => {
              const avgRating = u.stats?.averageRating || u.averageRating || 0
              return (
                <div key={u._id} className="col-sm-6 col-lg-4 col-xl-3">
                  <RouterLink to={`/profile/${u._id}`} className="text-decoration-none d-block h-100">
                    <div className="ss-card p-4 h-100 d-flex flex-column">
                      {/* Avatar + Name */}
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span className="ss-avatar ss-avatar-lg">{u.name?.charAt(0).toUpperCase()}</span>
                        <div className="overflow-hidden">
                          <div className="fw-bold text-truncate" style={{ color: 'var(--ss-text)' }}>{u.name}</div>
                          <div className="d-flex align-items-center gap-1">
                            <span style={{ fontSize: '0.7rem', color: 'var(--ss-warning)', fontWeight: 700 }}>★ {u.reputation || 100}</span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>· Lv.{u.level || 1}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {u.bio && (
                        <p className="text-secondary mb-3 flex-grow-1" style={{ fontSize: '0.78rem', lineHeight: 1.5, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                          {u.bio}
                        </p>
                      )}

                      {/* Skills to Teach */}
                      {u.skillsToTeach?.length > 0 && (
                        <div className="mb-1">
                          <div className="text-muted mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Can Teach</div>
                          <div className="d-flex flex-wrap gap-1">
                            {u.skillsToTeach.slice(0, 4).map((s, i) => (
                              <span key={i} className="ss-skill-tag">{s}</span>
                            ))}
                            {u.skillsToTeach.length > 4 && (
                              <span className="ss-badge ss-badge-secondary">+{u.skillsToTeach.length - 4}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Stats Footer */}
                      <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-check2-circle me-1 text-success"></i>
                          {u.stats?.sessionsHelped || 0} helped
                        </span>
                        {avgRating > 0 && (
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            ★ {Number(avgRating).toFixed(1)} avg
                          </span>
                        )}
                      </div>
                    </div>
                  </RouterLink>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
