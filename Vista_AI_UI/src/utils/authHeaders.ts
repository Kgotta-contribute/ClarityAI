 

export interface SSOUserInfo {

  displayName: string;

  domainID: string;

  email: string;

  groups: string[];

  token: string;

  tokenExpiry?: number;

}

 

export const getSSOUserInfo = (): SSOUserInfo | null => {

  try {

    const userInfoString = sessionStorage.getItem('okta_user_info');

    if (!userInfoString) {

      return null;

    }

    return JSON.parse(userInfoString) as SSOUserInfo;

  } catch (error) {

    console.error('Error parsing SSO user info:', error);

    return null;

  }

};

 

export const getSelectedBusinessGroup = (): string | null => {

  return localStorage.getItem('clarity_selected_group');

};

 

export const getAuthHeaders = (): Record<string, string> => {

  const headers: Record<string, string> = {

    // 'Content-Type': 'application/json',

  };

 

  const ssoInfo = getSSOUserInfo();

  if (ssoInfo) {

    if (ssoInfo.token) {

      headers['Authorization'] = `Bearer ${ssoInfo.token}`;

    }

 

    if (ssoInfo.groups && ssoInfo.groups.length > 1) {

      const selectedGroup = getSelectedBusinessGroup();

      if (selectedGroup) {

        headers['X-Business-Group'] = selectedGroup;

      }

    }

  }

 

  return headers;

};

 

export const isAuthenticated = (): boolean => {

  const ssoInfo = getSSOUserInfo();

  if (!ssoInfo || !ssoInfo.token) {

    return false;

  }

 

  if (ssoInfo.tokenExpiry) {

    const now = Date.now();

    const expiresAt = ssoInfo.tokenExpiry * 1000;

    if (now >= expiresAt) {

      console.warn('Token has expired');

      return false;

    }

  }

 

  return true;

};

 

export const getIDToken = (): string | null => {

  const ssoInfo = getSSOUserInfo();

  return ssoInfo?.token || null;

};

 

export const getUserDomainID = (): string | null => {

  const ssoInfo = getSSOUserInfo();

  return ssoInfo?.domainID || null;

};

 

export const getUserGroups = (): string[] => {

  const ssoInfo = getSSOUserInfo();

  return ssoInfo?.groups || [];

};

 

export const getTokenExpiry = (): number | null => {

  const ssoInfo = getSSOUserInfo();

  return ssoInfo?.tokenExpiry || null;

};

 

 