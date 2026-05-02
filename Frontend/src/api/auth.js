import api from './axiosInstance'

export const loginUser = (credentials) => api.post('/login/', credentials)

export const registerUser = (data) => api.post('/register/', data)

export const logoutUser = async () => {
  try {
    await api.post('/logout/')
  } catch {
    // Token may already be invalid
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getProfile = () => api.get('/profile/')

export const updateProfile = (data) => api.patch('/profile/', data)

export const changePassword = (data) => api.post('/password-change/', data)
