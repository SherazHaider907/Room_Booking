import { createContext, useContext, useState } from 'react'
import { loginUser, registerUser, logoutUser as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const login = async (credentials) => {
    const res = await loginUser(credentials)
    const { user, token } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    return user
  }

  const register = async (data) => {
    const res = await registerUser(data)
    const { user, token } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    return user
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
    setToken(null)
  }

  const updateUser = (updatedFields) => {
    const newUser = { ...user, ...updatedFields }
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const updateToken = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, updateToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
