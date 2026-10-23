import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Pages
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Requests from './pages/Requests'
import Dashboard from './pages/Dashboard'
import Directory from './pages/Directory'
import Leaderboard from './pages/Leaderboard'
import ChatRoom from './pages/ChatRoom'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100" style={{ background: 'var(--ss-bg)' }}>
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/:id" element={<PublicProfile />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:requestId"
                element={
                  <ProtectedRoute>
                    <ChatRoom />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="mt-auto py-3 border-top" style={{ background: 'var(--ss-surface)' }}>
            <div className="container">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="fw-bold text-primary" style={{ fontSize: '0.875rem' }}>⚡ SkillSync</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Free peer-to-peer learning · Real-time skill exchange
                </span>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App