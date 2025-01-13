import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8900',
  timeout: 30000,  // Increase the timeout to 30 seconds
});

export default axiosInstance;