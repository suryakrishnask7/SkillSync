import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ openRequests: 0, topHelpers: [] })

  useEffect(() => {
    async function loadData() {
      try {
        const [reqRes, helperRes] = await Promise.all([
          api.get('/api/requests'),
          api.get('/api/users/leaderboard/helpers')
        ])
        setStats({
          openRequests: reqRes.data?.length || 0,
          topHelpers: (helperRes.data || []).slice(0, 3)
        })
      } catch (err) {
        console.error('Home load error:', err)
      }
    }
    loadData()
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="ss-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="ss-hero-badge mb-3">
                <i className="bi bi-lightning-charge-fill"></i>
                Free · Peer-to-Peer · Real-Time
              </div>
              <h1 className="display-5 fw-bold mb-3" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Learn Any Skill Live.<br />
                <span style={{ color: 'var(--ss-primary)' }}>Teach & Build Reputation.</span>
              </h1>
              <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: 560, fontSize: '1rem' }}>
                SkillSync pairs curious learners with knowledgeable peers for instant 1-on-1 live sessions.
                Completely free, community-powered, and gamified.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                {user ? (
                  <>
                    <RouterLink to="/dashboard" className="btn btn-primary btn-lg">
                      <i className="bi bi-speedometer2 me-2"></i>Go to Dashboard
                    </RouterLink>
                    <RouterLink to="/requests" className="btn btn-outline-secondary btn-lg">
                      Browse Requests <span className="badge ms-1" style={{ background: 'var(--ss-primary-subtle)', color: 'var(--ss-primary)' }}>{stats.openRequests}</span>
                    </RouterLink>
                  </>
                ) : (
                  <>
                    <RouterLink to="/register" className="btn btn-primary btn-lg px-4">
                      Get Started Free
                    </RouterLink>
                    <RouterLink to="/requests" className="btn btn-outline-secondary btn-lg">
                      <i className="bi bi-search me-2"></i>Explore Requests
                    </RouterLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2" style={{ fontSize: '1.5rem' }}>How SkillSync Works</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Four steps to master anything or help someone grow.</p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'bi-pencil-square', title: 'Post a Request', desc: 'Describe the skill you need help with and what specific challenge you\'re facing.' },
              { icon: 'bi-hand-index-thumb', title: 'A Peer Accepts', desc: 'An experienced community member instantly accepts your request to help.' },
              { icon: 'bi-chat-dots', title: 'Live Private Chat', desc: 'Enter a secured real-time room to exchange knowledge, code, and ideas.' },
              { icon: 'bi-trophy', title: 'Earn & Rate', desc: 'Rate your helper, unlock achievement badges, build streaks, and climb leaderboards.' }
            ].map((step, i) => (
              <div key={i} className="col-sm-6 col-lg-3">
                <div className="ss-card p-4 h-100">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="ss-step-number">{i + 1}</div>
                    <i className={`bi ${step.icon} text-primary`} style={{ fontSize: 20 }}></i>
                  </div>
                  <h6 className="fw-bold mb-2">{step.title}</h6>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.8125rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-5" style={{ background: 'var(--ss-surface)', borderTop: '1px solid var(--ss-border)', borderBottom: '1px solid var(--ss-border)' }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <h2 className="fw-bold mb-3" style={{ fontSize: '1.4rem' }}>Real-time skill exchange, reimagined</h2>
              <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                {[
                  { icon: 'bi-shield-check', text: 'Private, authenticated chat rooms — only learner and helper' },
                  { icon: 'bi-clock-history', text: 'Message history preserved across reconnections' },
                  { icon: 'bi-star', text: 'Reputation system with 11 achievement badges and streaks' },
                  { icon: 'bi-graph-up', text: 'Live leaderboards for top helpers and most active learners' }
                ].map((f, i) => (
                  <li key={i} className="d-flex align-items-start gap-3">
                    <span className="ss-step-number mt-1" style={{ flexShrink: 0 }}>
                      <i className={`bi ${f.icon} text-primary`} style={{ fontSize: 14 }}></i>
                    </span>
                    <span className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-6">
              <div className="row g-3">
                {[
                  { label: 'Open Requests', value: stats.openRequests, icon: 'bi-grid', color: 'var(--ss-primary)' },
                  { label: 'Community Members', value: stats.topHelpers.length > 0 ? '100+' : '—', icon: 'bi-people', color: 'var(--ss-success)' },
                  { label: 'Avg. Session Rating', value: '4.8 ★', icon: 'bi-star-fill', color: 'var(--ss-warning)' },
                  { label: 'Skills Covered', value: '50+', icon: 'bi-journals', color: 'var(--ss-accent)' }
                ].map((s, i) => (
                  <div key={i} className="col-6">
                    <div className="ss-stat-card">
                      <div className="stat-icon mb-2" style={{ background: `${s.color}15`, color: s.color }}><i className={`bi ${s.icon}`}></i></div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="stat-label mt-1">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Mentors */}
      {stats.topHelpers.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h2 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>Top Community Mentors</h2>
                <p className="text-secondary mb-0" style={{ fontSize: '0.8125rem' }}>Recognised by peer ratings and reputation score.</p>
              </div>
              <RouterLink to="/leaderboard" className="btn btn-sm btn-outline-primary">
                Full Leaderboard <i className="bi bi-arrow-right ms-1"></i>
              </RouterLink>
            </div>
            <div className="row g-3">
              {stats.topHelpers.map((h, i) => (
                <div key={h._id} className="col-md-4">
                  <RouterLink to={`/profile/${h._id}`} className="text-decoration-none">
                    <div className="ss-card p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span className="ss-avatar ss-avatar-lg">{h.name?.charAt(0).toUpperCase()}</span>
                        <div>
                          <div className="fw-bold" style={{ color: 'var(--ss-text)' }}>{h.name}</div>
                          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Level {h.level || 1}</div>
                        </div>
                        <span className="ms-auto fs-4">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                      </div>
                      <p className="text-secondary mb-3" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                        {h.bio || 'Active peer mentor'}
                      </p>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span style={{ fontWeight: 700, color: 'var(--ss-warning)', fontSize: 13 }}>★ {h.reputation || 100} Rep</span>
                        <span className="text-secondary" style={{ fontSize: 12 }}>{h.stats?.sessionsHelped || 0} helped</span>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}