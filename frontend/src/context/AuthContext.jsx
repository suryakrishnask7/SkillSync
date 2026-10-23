import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  // Validate or refresh session on mount
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const res = await api.get('/api/users/me')
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
        } catch (err) {
          console.warn('Session expired or invalid:', err?.response?.data?.message)
          logout()
        }
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/users/me')
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      return res.data
    } catch (err) {
      console.error('Failed to refresh user:', err)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
