import axios from 'axios';

const API_TOKEN = process.env.REACT_APP_API_TOKEN;
const URL = process.env.REACT_APP_URL;

const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  },
});

export default axiosInstance;
