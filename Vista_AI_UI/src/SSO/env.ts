const LOCAL = 'local';
const DEV = 'dev';
const SIT = 'sit';
const UAT = 'uat';
const PERF = 'perf';
const PROD = 'prod';

let env: string = '';
let sso_client_id: string = '';
let sso_issuer: string = '';
let redirect_uri: string = '';
let path: string = '';
let api_base_url: string = '';

const LOCAL_PATH = '/auth/redirect';
const LOCAL_REDIRECT_URI = 'http://localhost:3000/auth/redirect';
const LOCAL_REACT_APP_SSO_CLIENT_ID = '0oa1163b2oflT4JIA298';
const LOCAL_REACT_APP_SSO_ISSUER = 'https://portalssoqa.EH.com/oauth2/ausefjy7k3J5S1AXz297';
const LOCAL_API_BASE_URL = 'http://localhost:5175';

const COMMON_PATH = '/auth/redirect';

const DEV_REDIRECT_URI = 'https://clarity-ai-dev.EH.com/auth/redirect';
const DEV_REACT_APP_SSO_CLIENT_ID = '0oa1163b2oflT4JIA298';
const DEV_REACT_APP_SSO_ISSUER = 'https://portalssoqa.EH.com/oauth2/ausefjy7k3J5S1AXz297';
const DEV_API_BASE_URL = 'https://clarity-ai-dev.EH.com/clarity-api';

const SIT_REDIRECT_URI = 'https://clarity-ai-sit.EH.com/auth/redirect';
const SIT_REACT_APP_SSO_CLIENT_ID = '0oa1163b2oflT4JIA298';
const SIT_REACT_APP_SSO_ISSUER = 'https://portalssoqa.EH.com/oauth2/ausefjy7k3J5S1AXz297';
const SIT_API_BASE_URL = 'https://clarity-ai-sit.EH.com/clarity-api';

const UAT_REDIRECT_URI = 'https://clarity-ai-uat.EH.com/auth/redirect';
const UAT_REACT_APP_SSO_CLIENT_ID = '0oa1163s0f52MD1S5298';
const UAT_REACT_APP_SSO_ISSUER = 'https://portalssoqa.EH.com/oauth2/ausefjy7k3J5S1AXz297';
const UAT_API_BASE_URL = 'https://clarity-ai-uat.EH.com/clarity-api';

const PERF_REDIRECT_URI = 'https://clarity-ai-perf.EH.com/auth/redirect';
const PERF_REACT_APP_SSO_CLIENT_ID = '0oa1163s0f52MD1S5298';
const PERF_REACT_APP_SSO_ISSUER = 'https://portalssoqa.EH.com/oauth2/ausefjy7k3J5S1AXz297';
const PERF_API_BASE_URL = 'https://clarity-ai-perf.EH.com/clarity-api';

const PROD_REDIRECT_URI = 'https://clarity-ai.EH.com/auth/redirect';
const PROD_REACT_APP_SSO_CLIENT_ID = '0oa1163b2oflT4JIA298';
const PROD_REACT_APP_SSO_ISSUER = 'https://portalssoqa.EH.com/oauth2/ausefjy7k3J5S1AXz297';
const PROD_API_BASE_URL = 'https://clarity-ai.EH.com/clarity-api';

const subdomain = window.location.origin.split(/\/\//)[1].split(/\./)[0];

console.log(`Detected subdomain: ${subdomain}`);

if (subdomain === LOCAL || subdomain.includes(LOCAL)) {
  env = LOCAL;
  sso_client_id = LOCAL_REACT_APP_SSO_CLIENT_ID;
  sso_issuer = LOCAL_REACT_APP_SSO_ISSUER;
  redirect_uri = LOCAL_REDIRECT_URI;
  api_base_url = LOCAL_API_BASE_URL;
  path = LOCAL_PATH;
} else {
  env = subdomain.split(/-/)[2] || subdomain.split(/-/)[0];

  switch (env) {
    case DEV:
      sso_client_id = DEV_REACT_APP_SSO_CLIENT_ID;
      sso_issuer = DEV_REACT_APP_SSO_ISSUER;
      redirect_uri = DEV_REDIRECT_URI;
      path = COMMON_PATH;
      api_base_url = DEV_API_BASE_URL;
      break;

    case SIT:
      sso_client_id = SIT_REACT_APP_SSO_CLIENT_ID;
      sso_issuer = SIT_REACT_APP_SSO_ISSUER;
      redirect_uri = SIT_REDIRECT_URI;
      path = COMMON_PATH;
      api_base_url = SIT_API_BASE_URL;
      break;

    case UAT:
      sso_client_id = UAT_REACT_APP_SSO_CLIENT_ID;
      sso_issuer = UAT_REACT_APP_SSO_ISSUER;
      redirect_uri = UAT_REDIRECT_URI;
      path = COMMON_PATH;
      api_base_url = UAT_API_BASE_URL;
      break;

    case PERF:
      sso_client_id = PERF_REACT_APP_SSO_CLIENT_ID;
      sso_issuer = PERF_REACT_APP_SSO_ISSUER;
      redirect_uri = PERF_REDIRECT_URI;
      path = COMMON_PATH;
      api_base_url = PERF_API_BASE_URL;
      break;

    case PROD:
      sso_client_id = PROD_REACT_APP_SSO_CLIENT_ID;
      sso_issuer = PROD_REACT_APP_SSO_ISSUER;
      redirect_uri = PROD_REDIRECT_URI;
      path = COMMON_PATH;
      api_base_url = PROD_API_BASE_URL;
      break;

    default:
      sso_client_id = LOCAL_REACT_APP_SSO_CLIENT_ID;
      sso_issuer = LOCAL_REACT_APP_SSO_ISSUER;
      redirect_uri = LOCAL_REDIRECT_URI;
      path = LOCAL_PATH;
      api_base_url = LOCAL_API_BASE_URL;
  }
}

const APP_ENV: string = env;
const SSO_CLIENT_ID: string = sso_client_id;
const SSO_ISSUER: string = sso_issuer;
const REDIRECT_URI: string = redirect_uri;
const ENVIRONMENT: string = env;
const PATH: string = path;
const API_BASE_URL: string = api_base_url;

export { APP_ENV, SSO_CLIENT_ID, SSO_ISSUER, REDIRECT_URI, ENVIRONMENT, PATH, API_BASE_URL };
