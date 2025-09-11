const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  PARTICIPANTS: `${API_BASE_URL}/api/participants`,
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  ADMIN: `${API_BASE_URL}/api/admin`
};

export default API_BASE_URL;
