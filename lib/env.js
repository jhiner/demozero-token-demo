const { getClientGrantId, setRequiredClientGrant, createAppClient, createAppResourceServer, createDemoOrg, createDemoRoles, createDemoConnection } = require('./handlers/bootstrap');

const resolvedEnv = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  BACKEND_CLIENT_ID: process.env.AUTH0_MGMT_CLIENT_ID,
  BACKEND_CLIENT_SECRET: process.env.AUTH0_MGMT_CLIENT_SECRET,
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

  console.log('----- Create Resource Server');
  await createAppResourceServer();

  console.log('----- Creating Org Connection');
  const demoConnection = await createDemoConnection();

  console.log('----- Creating Org and Roles');
  await createDemoOrg(demoConnection.id);
  await createDemoRoles();

  console.log('!!! REMEMBER TO ADD 127.0.0.1 myapp.com to /etc/hosts !!!');
  console.log('>>> Bootstrap Complete <<<');
};
console.log('2asd');
const getEnv = () => resolvedEnv;

module.exports = {
  getEnv,
  bootstrapProcess,
};
