import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function PublicProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/api/users/${id}`)
        setProfile(res.data)
      } catch (err) {
        setError('User not found or failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [id])

  if (loading) return (
    <div className="ss-loading" style={{ minHeight: '50vh' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      <span>Loading profile...</span>
    </div>
  )

  if (error) return (
    <div className="container py-5">
      <div className="alert alert-danger py-2 px-3" style={{ borderRadius: 8, fontSize: '0.875rem' }}>{error}</div>
    </div>
  )

  if (!profile) return null

  const allBadges = profile.badges || []

  return (
    <div className="container py-4" style={{ maxWidth: 780 }}>
      {/* Profile Banner */}
      <div className="ss-profile-banner mb-5">
        <div className="ss-profile-avatar-wrap">
          <span className="ss-avatar ss-avatar-xl" style={{ border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            {profile.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="ps-2 mb-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{profile.name}</h2>
        <div className="d-flex align-items-center gap-3 flex-wrap text-secondary" style={{ fontSize: '0.8125rem' }}>
          <span><i className="bi bi-award text-primary me-1"></i>Level {profile.level || 1}</span>
          <span><i className="bi bi-star-fill text-warning me-1"></i>{profile.reputation || 100} Reputation</span>
          {profile.averageRating > 0 && (
            <span><i className="bi bi-star-half text-warning me-1"></i>{Number(profile.averageRating).toFixed(1)} avg. rating</span>
          )}
        </div>
        {profile.bio && (
          <p className="mt-2 mb-0" style={{ fontSize: '0.9rem', color: 'var(--ss-text-secondary)', maxWidth: 560 }}>{profile.bio}</p>
        )}
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'bi-check2-circle', label: 'Sessions Helped', value: profile.stats?.sessionsHelped || 0, color: 'var(--ss-success)', bg: 'var(--ss-success-subtle)' },
          { icon: 'bi-book', label: 'Sessions Learned', value: profile.stats?.sessionsLearned || 0, color: 'var(--ss-primary)', bg: 'var(--ss-primary-subtle)' },
          { icon: 'bi-lightning-charge', label: 'Helping Streak', value: `${profile.streaks?.helpingStreak || 0}d`, color: 'var(--ss-accent)', bg: 'var(--ss-accent-subtle)' },
          { icon: 'bi-patch-check', label: 'Badges Earned', value: allBadges.length, color: 'var(--ss-warning)', bg: 'var(--ss-warning-subtle)' },
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

      {/* Skills */}
      <div className="row g-3 mb-4">
        {profile.skillsToTeach?.length > 0 && (
          <div className="col-md-6">
            <div className="ss-card p-4">
              <div className="ss-card-header px-0 pt-0 mb-3">
                <i className="bi bi-mortarboard-fill text-success me-2"></i>Skills to Teach
              </div>
              <div className="d-flex flex-wrap gap-2">
                {profile.skillsToTeach.map((s, i) => <span key={i} className="ss-skill-tag">{s}</span>)}
              </div>
            </div>
          </div>
        )}
        {profile.skillsToLearn?.length > 0 && (
          <div className="col-md-6">
            <div className="ss-card p-4">
              <div className="ss-card-header px-0 pt-0 mb-3">
                <i className="bi bi-book-fill text-primary me-2"></i>Skills to Learn
              </div>
              <div className="d-flex flex-wrap gap-2">
                {profile.skillsToLearn.map((s, i) => (
                  <span key={i} className="ss-badge ss-badge-secondary">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badges */}
      {allBadges.length > 0 && (
        <div className="ss-card p-4 mb-4">
          <div className="ss-card-header px-0 pt-0 mb-3">
            <i className="bi bi-patch-check-fill text-warning me-2"></i>Achievement Badges
          </div>
          <div className="row g-2">
            {allBadges.map(b => (
              <div key={b.id} className="col-4 col-sm-3 col-md-2">
                <div className="ss-achievement unlocked text-center p-3">
                  <div className="ss-achievement-icon mb-1">{b.icon}</div>
                  <div className="fw-bold" style={{ fontSize: '0.7rem', color: 'var(--ss-primary)' }}>{b.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
