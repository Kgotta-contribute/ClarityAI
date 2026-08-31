import { SSO_CLIENT_ID, SSO_ISSUER, REDIRECT_URI, ENVIRONMENT } from './env.ts';

const REACT_APP_SSO_CLIENT_ID = SSO_CLIENT_ID;

const REACT_APP_SSO_ISSUER = SSO_ISSUER;

 

const oktaConfig = {

  clientId: REACT_APP_SSO_CLIENT_ID,

  issuer: REACT_APP_SSO_ISSUER,

  redirectUri: REDIRECT_URI,

  scopes: ['openid', 'ehprofile', 'filteredgroups'],

  pkce: true,

  tokenManager: {

    storage: 'sessionStorage'

  },

  cookies: {

    secure: ENVIRONMENT === 'prod' || ENVIRONMENT === 'uat' || ENVIRONMENT === 'perf'

  },

};

 

export default oktaConfig;

 

 

 