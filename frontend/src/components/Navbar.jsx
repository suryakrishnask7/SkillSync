import React, { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar navbar-expand-lg ss-topnav px-0" style={{ height: '60px' }}>
      <div className="container">
        {/* Brand */}
        <RouterLink to="/" className="navbar-brand d-flex align-items-center gap-2">
          <span
            style={{
              width: 28, height: 28,
              background: 'var(--ss-primary)',
              borderRadius: 7,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 14
            }}
          >S</span>
          SkillSync
        </RouterLink>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#ssNavbar"
          aria-controls="ssNavbar"
          aria-expanded="false"
        >
          <i className="bi bi-list" style={{ fontSize: 22, color: 'var(--ss-text)' }}></i>
        </button>

        {/* Collapsible Items */}
        <div className="collapse navbar-collapse" id="ssNavbar">
          {/* Center Links */}
          <ul className="navbar-nav mx-auto gap-1">
            <li className="nav-item">
              <RouterLink to="/requests" className={`nav-link ${isActive('/requests')}`}>
                <i className="bi bi-grid me-1"></i>Browse Requests
              </RouterLink>
            </li>
            <li className="nav-item">
              <RouterLink to="/directory" className={`nav-link ${isActive('/directory')}`}>
                <i className="bi bi-people me-1"></i>Helpers
              </RouterLink>
            </li>
            <li className="nav-item">
              <RouterLink to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>
                <i className="bi bi-trophy me-1"></i>Leaderboard
              </RouterLink>
            </li>
            {user && (
              <li className="nav-item">
                <RouterLink to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                  <i className="bi bi-speedometer2 me-1"></i>Dashboard
                </RouterLink>
              </li>
            )}
          </ul>

          {/* Right Auth Area */}
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                {/* Mini Reputation Pill */}
                <div
                  className="d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                  style={{ background: 'var(--ss-primary-subtle)', border: '1px solid rgba(79,70,229,0.12)', fontSize: 12 }}
                >
                  <span style={{ color: 'var(--ss-warning)', fontWeight: 700 }}>★ {user.reputation || 100}</span>
                  <span style={{ color: '#c7c7d6' }}>|</span>
                  <span style={{ color: 'var(--ss-primary)', fontWeight: 600 }}>Lv.{user.level || 1}</span>
                </div>

                {/* Profile Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-sm d-flex align-items-center gap-2"
                    style={{ border: '1px solid var(--ss-border)', borderRadius: 8, padding: '0.35rem 0.75rem', background: 'white', fontWeight: 600, fontSize: 13 }}
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <span className="ss-avatar ss-avatar-sm">{user.name?.charAt(0).toUpperCase()}</span>
                    <span className="d-none d-md-inline">{user.name?.split(' ')[0]}</span>
                    <i className="bi bi-chevron-down" style={{ fontSize: 10 }}></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ borderRadius: 10, border: '1px solid var(--ss-border)', minWidth: 180, marginTop: 6 }}>
                    <li>
                      <RouterLink to="/profile" className="dropdown-item d-flex align-items-center gap-2" style={{ fontSize: 13, padding: '0.5rem 1rem' }}>
                        <i className="bi bi-person-circle text-primary"></i> My Profile
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink to="/dashboard" className="dropdown-item d-flex align-items-center gap-2" style={{ fontSize: 13, padding: '0.5rem 1rem' }}>
                        <i className="bi bi-speedometer2 text-primary"></i> Dashboard
                      </RouterLink>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item d-flex align-items-center gap-2" style={{ fontSize: 13, padding: '0.5rem 1rem', color: '#ef4444' }}>
                        <i className="bi bi-box-arrow-right"></i> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <RouterLink to="/login" className="btn btn-sm" style={{ color: 'var(--ss-text-secondary)', border: '1px solid var(--ss-border)', borderRadius: 8 }}>
                  Sign In
                </RouterLink>
                <RouterLink to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </RouterLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}