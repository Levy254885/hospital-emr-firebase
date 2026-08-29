import axios from 'axios'
const api = axios.create({ baseURL: '/api-deprecated', timeout: 5000 })
api.interceptors.request.use((config) => {
  console.warn('[DEPRECATED] Laravel API:', config.url, '— use Firebase services')
  return config
})
export default api
