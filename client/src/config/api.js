// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nscc-backend-9rfad6hit-shashank-tiwaris-projects-fefdbac7.vercel.app';

// Log the API URL for debugging
console.log('Environment REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  PARTICIPANTS: `${API_BASE_URL}/api/participants`,
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  ADMIN: `${API_BASE_URL}/api/admin`
};

export default API_BASE_URL;
