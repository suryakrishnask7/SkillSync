import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', bio: '', skillsToTeach: '', skillsToLearn: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/users/register', form)
      if (res.data.token && res.data.user) {
        login(res.data.user, res.data.token)
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'var(--ss-bg)', padding: '2rem 1rem' }}>
      <div className="w-100" style={{ maxWidth: 520 }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <RouterLink to="/" className="text-decoration-none">
            <div className="d-inline-flex align-items-center gap-2">
              <span style={{ width: 36, height: 36, background: 'var(--ss-primary)', borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18 }}>S</span>
              <span className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--ss-primary)', letterSpacing: '-0.03em' }}>SkillSync</span>
            </div>
          </RouterLink>
          <p className="text-secondary mt-2 mb-0" style={{ fontSize: '0.875rem' }}>Join the peer-to-peer learning community — it's free</p>
        </div>

        <div className="ss-card p-0 overflow-hidden">
          <div className="p-4 p-md-5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4" style={{ borderRadius: 8, fontSize: '0.85rem' }}>
                <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} noValidate>
              <div className="row g-3 mb-1">
                <div className="col-12">
                  <label className="form-label" htmlFor="name">Full Name <span className="text-danger">*</span></label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="reg-email">Email Address <span className="text-danger">*</span></label>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="reg-password">Password <span className="text-danger">*</span> <span className="text-muted fw-normal">(min 6 chars)</span></label>
                  <div className="input-group">
                    <input
                      id="reg-password"
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      className="form-control border-end-0"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
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

                <div className="col-12">
                  <label className="form-label" htmlFor="bio">Short Bio <span className="text-muted fw-normal">(optional)</span></label>
                  <input
                    id="bio"
                    type="text"
                    name="bio"
                    className="form-control"
                    placeholder="e.g. Frontend dev passionate about design systems"
                    value={form.bio}
                    onChange={handleChange}
                    maxLength={500}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="skillsToTeach">Skills I Can Teach <span className="text-muted fw-normal">(comma-separated)</span></label>
                  <input
                    id="skillsToTeach"
                    type="text"
                    name="skillsToTeach"
                    className="form-control"
                    placeholder="JavaScript, Python, Figma, Docker"
                    value={form.skillsToTeach}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="skillsToLearn">Skills I Want to Learn <span className="text-muted fw-normal">(comma-separated)</span></label>
                  <input
                    id="skillsToLearn"
                    type="text"
                    name="skillsToLearn"
                    className="form-control"
                    placeholder="TypeScript, Rust, Machine Learning"
                    value={form.skillsToLearn}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mt-4"
                disabled={loading}
                style={{ padding: '0.6rem' }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</>
                ) : (
                  <><i className="bi bi-person-plus me-2"></i>Create Free Account</>
                )}
              </button>
            </form>
          </div>

          <div className="text-center py-3 px-4 border-top" style={{ background: '#fafafa', fontSize: '0.8125rem' }}>
            Already have an account?{' '}
            <RouterLink to="/login" className="fw-semibold">Sign in</RouterLink>
          </div>
        </div>
      </div>
    </div>
  )
}