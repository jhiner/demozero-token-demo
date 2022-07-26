const { getClientGrantId, setRequiredClientGrant, createAppClient, createAppResourceServer, createDemoOrg, createDemoRoles, createDemoConnection, createSAMLAppClient, fetchSamlAppCert, createDemoRule } = require('./handlers/bootstrap');
const { AUTH_REQUESTED_SCOPES, APP_RESOURCE_SERVER_IDENTIFIER } = require('../lib/constants');
const DEFAULT_PROMPT_VALUE = '';

const resolvedEnv = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  BACKEND_CLIENT_ID: process.env.AUTH0_MGMT_CLIENT_ID,
  BACKEND_CLIENT_SECRET: process.env.AUTH0_MGMT_CLIENT_SECRET,
  ORG_NAME_OPTION: process.env.ORG_NAME_OPTION === 'true',
  audience: APP_RESOURCE_SERVER_IDENTIFIER,
  scope: AUTH_REQUESTED_SCOPES,
  prompt: DEFAULT_PROMPT_VALUE
};

const pemToCert = (pem) => {
  if (!/-----BEGIN CERTIFICATE-----/.test(pem.toString())) {
    return pem.toString();
  }

  const cert = /-----BEGIN CERTIFICATE-----([^-]*)-----END CERTIFICATE-----/g.exec(pem.toString()) || [];
  if (cert.length > 0) {
    return cert[1].replace(/[\n|\r\n]/g, '');
  }

  return '';
};

const bootstrapProcess = async () => {
  console.log('>>> Bootstrapping Demo <<<');
  console.log('----- Get Client Grant');
  const clientGrantId = await getClientGrantId();

  console.log('----- Update Client Grant');
  await setRequiredClientGrant(clientGrantId);

  console.log('----- Create App Client');
  const appClient = await createAppClient();
  resolvedEnv.APP_CLIENT_ID = appClient.client_id;
  resolvedEnv.APP_CLIENT_SECRET = appClient.client_secret;

  console.log('----- Create SAML App Client');
  const samlAppClient = await createSAMLAppClient();
  resolvedEnv.SAML_APP_CLIENT_ID = samlAppClient.client_id;

  console.log('----- Fetch SAML App Cert');
  const samlAppCert = await fetchSamlAppCert();
  resolvedEnv.SAML_CERT = pemToCert(samlAppCert);

  console.log('----- Create Resource Server');
  await createAppResourceServer();

  console.log('----- Creating Org Connection');
  const demoConnection = await createDemoConnection();

  console.log('----- Creating Org, Roles, and Rule');
  await createDemoOrg(demoConnection.id);
  await createDemoRoles();
  await createDemoRule();

  console.log('!!! REMEMBER TO ADD 127.0.0.1 myapp.com to /etc/hosts !!!');
  console.log('>>> Bootstrap Complete <<<');
};
const getEnv = () => resolvedEnv;

const setEnv = (envVariableName, value) => {
  resolvedEnv[envVariableName] = value;
  console.log('---- updated configuration');
  console.log(resolvedEnv);
};

module.exports = {
  getEnv,
  setEnv,
  bootstrapProcess
};
