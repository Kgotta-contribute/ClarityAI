
import { ENVIRONMENT } from './env';

import { getAuthHeaders } from '../utils/authHeaders';

import { getStoredTokenExpiration } from '../utils/tokenManager';

 

console.log('env is ', ENVIRONMENT);

 

const isTokenExpired = () => {
  return false;
};

 

const isTokenExpiringSoon = () => {
  return false;
};

 

export const fetchInterceptor = () => {

  const originalFetch = window.fetch;

  window.fetch = function (...args) {

    let url;

    let options;

 

    if (args[0] instanceof Request) {

      url = args[0].url;

      options = {

        method: args[0].method,

        headers: args[0].headers,

        body: args[0].body,

        mode: args[0].mode,

        credentials: args[0].credentials,

        cache: args[0].cache,

        redirect: args[0].redirect,

        referrer: args[0].referrer,

        integrity: args[0].integrity

      };

      if (args[1]) {

        options = { ...options, ...args[1] };

      }

    } else {

      url = args[0];

      options = args[1] || {};

    }

    const urlString = url.toString();

 

    if (urlString.includes('portalsso')) {

      const separator = urlString.includes('?') ? '&' : '?';

      const modifiedUrl = `${urlString}${separator}appName=clarity_${ENVIRONMENT}`;

 

      if (args[0] instanceof Request) {

        const modifiedRequest = new Request(modifiedUrl, options);

        return originalFetch.call(this, modifiedRequest);

      } else {

        return originalFetch.call(this, modifiedUrl, options);

      }

    }

 

    if (!urlString.includes('portalsso') && !urlString.includes('okta.com')) {

      if (isTokenExpired()) {

        return Promise.reject(new Error('Authentication token has expired. Please log in again.'));

      }

 

      if (isTokenExpiringSoon()) {

        console.warn('Token expiring soon');

      }

 

      const authHeaders = getAuthHeaders();

      const existingHeaders = options.headers || {};

      const mergedHeaders = new Headers(existingHeaders);

      Object.entries(authHeaders).forEach(([key, value]) => {

        if (!mergedHeaders.has(key)) {

          mergedHeaders.set(key, value);

        }

      });

 

      options = {

        ...options,

        headers: mergedHeaders

      };

 

      if (args[0] instanceof Request) {

        const modifiedRequest = new Request(url, options);

        return originalFetch.call(this, modifiedRequest).catch(error => {

          if (error.status === 401 || error.message?.includes('401')) {

            window.dispatchEvent(new CustomEvent('token-expired'));

          }

          throw error;

        });

      } else {

        return originalFetch.call(this, url, options).catch(error => {

          if (error.status === 401 || error.message?.includes('401')) {

            window.dispatchEvent(new CustomEvent('token-expired'));

          }

          throw error;

        });

      }

    }

 

    return originalFetch.apply(this, args);

  };

};

 