import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Leaderboard() {
  const { user } = useAuth()
  const [helpers, setHelpers] = useState([])
  const [learners, setLearners] = useState([])
  const [tab, setTab] = useState('helpers')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [hRes, lRes] = await Promise.all([
          api.get('/api/users/leaderboard/helpers'),
          api.get('/api/users/leaderboard/learners')
        ])
        setHelpers(hRes.data || [])
        setLearners(lRes.data || [])
      } catch (err) {
        setError('Failed to load leaderboard data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const MEDALS = ['🥇', '🥈', '🥉']

  const RankRow = ({ person, rank, metric, metricLabel }) => {
    const isCurrentUser = user && person._id === user._id
    return (
      <tr className={isCurrentUser ? 'ss-lb-row current-user' : ''}>
        <td className="align-middle" style={{ width: 60, paddingLeft: '1.25rem' }}>
          {rank <= 3 ? (
            <span className="ss-lb-rank">{MEDALS[rank - 1]}</span>
          ) : (
            <span className="text-muted fw-semibold" style={{ fontSize: 14 }}>#{rank}</span>
          )}
        </td>
        <td className="align-middle py-3">
          <div className="d-flex align-items-center gap-3">
            <span className="ss-avatar ss-avatar-sm">{person.name?.charAt(0).toUpperCase()}</span>
            <div>
              <div className="fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '0.875rem' }}>
                {person.name}
                {isCurrentUser && <span className="ss-badge ss-badge-primary">You</span>}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Level {person.level || 1}</div>
            </div>
          </div>
        </td>
        <td className="align-middle text-end pe-4">
          <div className="fw-bold" style={{ color: 'var(--ss-primary)' }}>{metric}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{metricLabel}</div>
        </td>
        <td className="align-middle pe-4">
          <span style={{ fontWeight: 700, color: 'var(--ss-warning)', fontSize: 13 }}>★ {person.reputation || 100}</span>
        </td>
        <td className="align-middle pe-4 d-none d-md-table-cell">
          <RouterLink to={`/profile/${person._id}`} className="btn btn-sm btn-outline-secondary" style={{ fontSize: 12 }}>
            View
          </RouterLink>
        </td>
      </tr>
    )
  }

  const currentList = tab === 'helpers' ? helpers : learners

  const findMyRank = () => {
    if (!user) return null
    const idx = currentList.findIndex(p => p._id === user._id)
    return idx !== -1 ? idx + 1 : null
  }

  const myRank = findMyRank()

  return (
    <div className="container py-4" style={{ maxWidth: 820 }}>
      {/* Header */}
      <div className="text-center mb-5">
        <div className="mb-2" style={{ fontSize: '2rem' }}>🏆</div>
        <h1 className="h3 fw-bold mb-2">Community Leaderboard</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Recognition for the most impactful peers in the SkillSync community.</p>
        {myRank && (
          <div className="d-inline-flex align-items-center gap-2 mt-2 px-3 py-1 rounded-pill" style={{ background: 'var(--ss-primary-subtle)', border: '1px solid rgba(79,70,229,0.15)', fontSize: 13 }}>
            <span style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>You are ranked #{myRank}</span>
            <span className="text-secondary">in {tab === 'helpers' ? 'Top Helpers' : 'Top Learners'}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs border-bottom-0 mb-0" style={{ borderBottom: 'none' }}>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === 'helpers' ? 'active' : 'text-secondary'}`}
            onClick={() => setTab('helpers')}
            style={{ fontSize: '0.875rem', border: 'none', borderBottom: tab === 'helpers' ? '2px solid var(--ss-primary)' : '2px solid transparent', borderRadius: 0, color: tab === 'helpers' ? 'var(--ss-primary)' : undefined, background: 'none', paddingBottom: '0.65rem' }}
          >
            <i className="bi bi-heart-fill me-1 text-danger"></i>Top Helpers
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === 'learners' ? 'active' : 'text-secondary'}`}
            onClick={() => setTab('learners')}
            style={{ fontSize: '0.875rem', border: 'none', borderBottom: tab === 'learners' ? '2px solid var(--ss-primary)' : '2px solid transparent', borderRadius: 0, color: tab === 'learners' ? 'var(--ss-primary)' : undefined, background: 'none', paddingBottom: '0.65rem' }}
          >
            <i className="bi bi-book-fill me-1 text-primary"></i>Top Learners
          </button>
        </li>
      </ul>

      <div className="ss-card p-0 overflow-hidden">
        {loading ? (
          <div className="ss-loading py-5">
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            <span>Loading leaderboard...</span>
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="alert alert-danger py-2 px-3" style={{ borderRadius: 8, fontSize: '0.875rem' }}>{error}</div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="ss-empty">
            <div className="ss-empty-icon">📊</div>
            <h6 className="fw-bold">No data yet</h6>
            <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>Start helping peers to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table ss-lb-table mb-0 align-middle">
              <thead>
                <tr style={{ background: '#f8f9fb', fontSize: '0.75rem', color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ paddingLeft: '1.25rem', fontWeight: 600, paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>Rank</th>
                  <th style={{ fontWeight: 600 }}>Member</th>
                  <th className="text-end pe-4" style={{ fontWeight: 600 }}>{tab === 'helpers' ? 'Sessions Helped' : 'Sessions Learned'}</th>
                  <th style={{ fontWeight: 600 }}>Reputation</th>
                  <th className="d-none d-md-table-cell" style={{ fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((person, i) => (
                  <RankRow
                    key={person._id}
                    person={person}
                    rank={i + 1}
                    metric={tab === 'helpers' ? (person.stats?.sessionsHelped || 0) : (person.stats?.sessionsLearned || 0)}
                    metricLabel={tab === 'helpers' ? 'helped' : 'sessions'}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
