import React, { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/users/login', form)
      login(res.data.user, res.data.token)
      const destination = location.state?.from?.pathname || '/dashboard'
      navigate(destination)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'var(--ss-bg)', padding: '2rem 1rem' }}>
      <div className="w-100" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <RouterLink to="/" className="text-decoration-none">
            <div className="d-inline-flex align-items-center gap-2">
              <span style={{ width: 36, height: 36, background: 'var(--ss-primary)', borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18 }}>S</span>
              <span className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--ss-primary)', letterSpacing: '-0.03em' }}>SkillSync</span>
            </div>
          </RouterLink>
          <p className="text-secondary mt-2 mb-0" style={{ fontSize: '0.875rem' }}>Welcome back — sign in to your account</p>
        </div>

        {/* Card */}
        <div className="ss-card p-0 overflow-hidden">
          <div className="p-4 p-md-5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4" style={{ borderRadius: 8, fontSize: '0.85rem' }}>
                <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="input-group">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    className="form-control border-end-0"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ border: '1px solid var(--ss-border)', borderLeft: 'none', background: 'white', borderRadius: '0 var(--ss-radius-sm) var(--ss-radius-sm) 0', color: 'var(--ss-text-secondary)' }}
                    onClick={() => setShowPass(!showPass)}
                  >
                    <i className={`bi bi-eye${showPass ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
                style={{ padding: '0.6rem' }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                ) : (
                  <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
                )}
              </button>
            </form>
          </div>

          <div className="text-center py-3 px-4 border-top" style={{ background: '#fafafa', fontSize: '0.8125rem' }}>
            Don't have an account?{' '}
            <RouterLink to="/register" className="fw-semibold">Create one free</RouterLink>
          </div>
        </div>
      </div>
    </div>
  )
}