
import axios from 'axios';

import { getAuthHeaders } from './authHeaders';

 

export const axiosInstance = axios.create();

 

axiosInstance.interceptors.request.use(

  (config) => {

    const authHeaders = getAuthHeaders();

    Object.entries(authHeaders).forEach(([key, value]) => {

      config.headers.set(key, value);

    });

    return config;

  },

  (error) => {

    return Promise.reject(error);

  }

);

 

axiosInstance.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      console.error('Authentication failed. Please log in again.');

    }

    return Promise.reject(error);

  }

);

 

export default axiosInstance;

 

 