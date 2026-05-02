import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { getProfile, updateProfile, changePassword } from '../api/auth'
import { FaUser, FaEnvelope, FaIdCard, FaLock, FaSave } from 'react-icons/fa'
import './Profile.css'

export default function Profile() {
  const { user, updateUser, updateToken, logout } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', full_name: '' })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' })
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    getProfile()
      .then((res) => setForm({ email: res.data.email, full_name: res.data.full_name }))
      .catch(() => toast.error('Failed to load profile.'))
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await updateProfile(form)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Update failed.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwLoading(true)
    try {
      const res = await changePassword(pwForm)
      updateToken(res.data.token)
      toast.success('Password changed!')
      setPwForm({ old_password: '', new_password: '' })
    } catch (err) {
      const msg = err.response?.data?.old_password || err.response?.data?.new_password?.[0] || 'Failed.'
      toast.error(msg)
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <h1><FaUser /> My Profile</h1>

      <div className="profile-grid">
        {/* Profile Info */}
        <div className="profile-card">
          <h2>Account Details</h2>
          <div className="profile-header">
            <div className="avatar">{(user?.full_name || user?.username || '?')[0].toUpperCase()}</div>
            <div>
              <p className="profile-name">{user?.full_name || user?.username}</p>
              <p className="profile-username">@{user?.username}</p>
            </div>
          </div>
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="input-group">
              <FaIdCard className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-save" disabled={loading}>
              <FaSave /> {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="profile-card">
          <h2><FaLock /> Change Password</h2>
          <form onSubmit={handlePasswordChange} className="profile-form">
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Current Password"
                value={pwForm.old_password}
                onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="New Password (min 8 chars)"
                value={pwForm.new_password}
                onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="btn-save" disabled={pwLoading}>
              <FaLock /> {pwLoading ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
