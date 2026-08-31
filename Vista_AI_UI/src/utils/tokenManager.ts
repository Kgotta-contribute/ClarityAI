
import type { AccessToken, IDToken, OktaAuth } from '@okta/okta-auth-js';

 

const error = (...args: unknown[]) => console.error(...args);

 

export interface TokenInfo {

  accessToken: AccessToken | null;

  idToken: IDToken | null;

  expiresAt: number | null;

  isExpired: boolean;

  isExpiringSoon: boolean;

  timeUntilExpiry: number | null;

}

 

const TOKEN_EXPIRY_WARNING_TIME = 5 * 60 * 1000;

const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000;

const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

const INACTIVITY_WARNING_TIME = 5 * 60 * 1000;

 

export const getTokenInfo = async (oktaAuth: OktaAuth): Promise<TokenInfo> => {

  try {

    const accessToken = (await oktaAuth.tokenManager.get('accessToken')) as AccessToken | null;

    const idToken = (await oktaAuth.tokenManager.get('idToken')) as IDToken | null;

 

    if (!accessToken || !idToken) {

      return {

        accessToken: null,

        idToken: null,

        expiresAt: null,

        isExpired: true,

        isExpiringSoon: false,

        timeUntilExpiry: null,

      };

    }

 

    const expiresAt = accessToken.expiresAt * 1000;

    const now = Date.now();

    const timeUntilExpiry = expiresAt - now;

 

    return {

      accessToken,

      idToken,

      expiresAt,

      isExpired: timeUntilExpiry <= 0,

      isExpiringSoon: timeUntilExpiry > 0 && timeUntilExpiry <= TOKEN_EXPIRY_WARNING_TIME,

      timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : null,

    };

  } catch (err) {

    error('[TokenManager] Error getting token info:', err);

    return {

      accessToken: null,

      idToken: null,

      expiresAt: null,

      isExpired: true,

      isExpiringSoon: false,

      timeUntilExpiry: null,

    };

  }

};

 

export const shouldRefreshToken = (tokenInfo: TokenInfo): boolean => {

  if (!tokenInfo.timeUntilExpiry) return true;

  return tokenInfo.timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;

};

 

export const refreshTokens = async (oktaAuth: OktaAuth): Promise<boolean> => {

  try {

    await oktaAuth.tokenManager.renew('accessToken');

    await oktaAuth.tokenManager.renew('idToken');

    return true;

  } catch (err) {

    error('[TokenManager] Error refreshing tokens:', err);

    return false;

  }

};

 

export const shouldRefreshTokenForActiveUser = async (oktaAuth: OktaAuth): Promise<boolean> => {

  try {

    const tokenInfo = await getTokenInfo(oktaAuth);

   

    if (tokenInfo.isExpired) {

      return false;

    }

   

    if (tokenInfo.timeUntilExpiry && tokenInfo.timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD) {

      return true;

    }

   

    return false;

  } catch (err) {

    error('[TokenManager] Error checking if token should refresh:', err);

    return false;

  }

};

 

export const clearAuthData = (): void => {

  sessionStorage.removeItem('okta_user_info');

  sessionStorage.removeItem('okta-token-storage');

  sessionStorage.removeItem('okta-shared-transaction-storage');

  sessionStorage.removeItem('oauth_callback_completed');

  localStorage.removeItem('clarity_user');

  localStorage.removeItem('clarity_authenticated');

  localStorage.removeItem('clarity_selected_group');

};

 

export const formatTimeUntilExpiry = (milliseconds: number): string => {

  const minutes = Math.floor(milliseconds / 60000);

  const seconds = Math.floor((milliseconds % 60000) / 1000);

 

  if (minutes > 60) {

    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;

  }

 

  if (minutes > 0) {

    return `${minutes}m ${seconds}s`;

  }

 

  return `${seconds}s`;

};

 

export const getInactivityTimeout = (): number => {

  return INACTIVITY_TIMEOUT;

};

 

export const getInactivityWarningTime = (): number => {

  return INACTIVITY_WARNING_TIME;

};

 

export const formatInactivityTime = (milliseconds: number): string => {

  const minutes = Math.floor(milliseconds / 60000);

  const seconds = Math.floor((milliseconds % 60000) / 1000);

 

  if (minutes >= 60) {

    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    if (remainingMinutes > 0) {

      return `${hours}h ${remainingMinutes}m`;

    }

    return `${hours}h`;

  }

 

  if (minutes > 0) {

    return `${minutes}m ${seconds}s`;

  }

 

  return `${seconds}s`;

};

 

export const setupTokenExpirationListener = (

  oktaAuth: OktaAuth,

  onTokenExpired: () => void,

  onTokenExpiringSoon: (timeRemaining: number) => void

): (() => void) => {

  const checkTokenExpiration = async () => {

    const tokenInfo = await getTokenInfo(oktaAuth);

 

    if (tokenInfo.isExpired) {

      onTokenExpired();

    } else if (tokenInfo.isExpiringSoon && tokenInfo.timeUntilExpiry) {

      onTokenExpiringSoon(tokenInfo.timeUntilExpiry);

    }

  };

 

  const checkInterval = setInterval(checkTokenExpiration, 30000);

  checkTokenExpiration();

 

  return () => {

    clearInterval(checkInterval);

  };

};

 

export const getStoredTokenExpiration = (): number | null => {

  try {

    const tokenStorage = sessionStorage.getItem('okta-token-storage');

    if (!tokenStorage) return null;

 

    const parsed = JSON.parse(tokenStorage);

    const accessToken = parsed.accessToken;

   

    if (accessToken && accessToken.expiresAt) {

      return accessToken.expiresAt * 1000;

    }

   

    return null;

  } catch (err) {

    error('[TokenManager] Error reading token expiration from storage:', err);

    return null;

  }

};

 

 

 