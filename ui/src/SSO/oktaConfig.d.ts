
declare const oktaConfig: {

  clientId: string;

  issuer: string;

  redirectUri: string;

  scopes: string[];

  pkce: boolean;

  state: string;

  endSessionEndpoint: string;

  revokeAccessTokenOnSignout: boolean;

  clearTokensBeforeRedirect: boolean;

  tokenManager: {

    storage: string;

  };

};

 

export default oktaConfig;

 

 

 