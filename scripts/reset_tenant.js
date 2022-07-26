const dotenv = require('dotenv');
const { APP_RESOURCE_SERVER_IDENTIFIER, CLIENT_NAME_FOR_DEMO_APP, DEMO_ORG_NAME, DEMO_ROLE_NAME_PREFIX, DEMO_CONNECTION_NAME, CLIENT_NAME_FOR_SAML_DEMO_APP, DEMO_RULE_NAME } = require('../lib/constants');
const { makeApi2Request } = require('../lib/api2');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config();

const resetTenant = async () => {
  console.log('This script will remove artifacts from the tenant used for this demo app.');
  console.log('The next time the app boots, these artifacts will be re-created.');
  console.log('>>> DELETING CLIENT');
  await deleteAppClient();
  await deleteSamlAppClient();
  console.log('>>> DELETING RESOURCE SERVER');
  await deleteAppResourceServer();
  console.log('>>> DELETING ORG');
  await deleteDemoOrg();
  console.log('>>> DELETING ROLES');
  await deleteDemoRoles();
  console.log('>>> DELETING CONNECTION');
  await deleteDemoConnection();
  console.log('>>> DELETE RULE');
  await deleteRule();
};

const deleteDemoOrg = async () => {
  try {
    const orgIdRequest = {
      path: `organizations/name/${DEMO_ORG_NAME}`,
    };

    const demoOrganization = await makeApi2Request(orgIdRequest);

    const deleteOrgRequest = {
      method: 'delete',
      path: `organizations/${demoOrganization.id}`,
    };
    await makeApi2Request(deleteOrgRequest);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAppClient = async () => {
  const getClientsRequest = {
    path: 'clients?page=0&per_page=100',
  };

  const clients = await makeApi2Request(getClientsRequest);
  const appClient = clients.filter((client) => client.name === CLIENT_NAME_FOR_DEMO_APP);
  if (appClient.length < 1) {
    return;
  }

  const request = {
    method: 'delete',
    path: `clients/${appClient[0].client_id}`,
  };
  await makeApi2Request(request);
};

const deleteRule = async () => {
  const getRulesRequest = {
    path: 'rules?page=0&per_page=100',
  };

  const rules = await makeApi2Request(getRulesRequest);
  const demoRule = rules.filter((rules) => rules.name === DEMO_RULE_NAME);
  if (demoRule.length < 1) {
    return;
  }

  const request = {
    method: 'delete',
    path: `rules/${demoRule[0].id}`,
  };
  await makeApi2Request(request);
};

const deleteSamlAppClient = async () => {
  const getClientsRequest = {
    path: 'clients?page=0&per_page=100',
  };

  const clients = await makeApi2Request(getClientsRequest);
  const appClient = clients.filter((client) => client.name === CLIENT_NAME_FOR_SAML_DEMO_APP);
  if (appClient.length < 1) {
    return;
  }

  const request = {
    method: 'delete',
    path: `clients/${appClient[0].client_id}`,
  };
  await makeApi2Request(request);
};

const deleteAppResourceServer = async () => {
  const request = {
    method: 'delete',
    path: `resource-servers/${APP_RESOURCE_SERVER_IDENTIFIER}`,
  };
  await makeApi2Request(request);
};

const deleteDemoRoles = async () => {
  const requestOptions = {
    path: `roles?name_filter=${DEMO_ROLE_NAME_PREFIX}`,
  };

  try {
    const response = await makeApi2Request(requestOptions);

    if (response.length === 0) {
      return;
    }

    const roleIds = response.map((role) => role.id);

    // TODO: limit to 2 for now, but should make it more dynamic
    await deleteRole(roleIds[0]);
    await deleteRole(roleIds[1]);

    return response;
  } catch (error) {
    console.log(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting org: ${error.message}`);
  }
};

const deleteRole = async (roleId) => {
  const requestOptions = {
    method: 'delete',
    path: `roles/${roleId}`,
  };

  await makeApi2Request(requestOptions);
};

const deleteDemoConnection = async () => {
  let requestOptions = {
    path: 'connections?page=0&per_page=100',
  };

  const connections = await makeApi2Request(requestOptions);
  const demoConnection = connections.filter((connection) => connection.name === DEMO_CONNECTION_NAME);
  if (demoConnection.length === 0) {
    return;
  }

  await makeApi2Request({
    method: 'delete',
    path: `connections/${demoConnection[0].id}`,
  });
};

resetTenant();
