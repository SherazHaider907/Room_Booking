import api from './axiosInstance'

export const getRooms = (params = {}) => api.get('/rooms/', { params })

export const getRoomById = (id) => api.get(`/rooms/${id}/`)

export const getRoomAvailability = (id) => api.get(`/rooms/${id}/availability/`)
