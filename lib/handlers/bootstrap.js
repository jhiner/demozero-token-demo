const axios = require("axios");

const { makeApi2Request } = require("../api2");
const {
  CLIENT_NAME_FOR_DEMO_APP,
  CLIENT_NAME_FOR_SAML_DEMO_APP,
  REQUIRED_SCOPES_FOR_BACKEND_CLIENT,
  APP_RESOURCE_SERVER_IDENTIFIER,
  APP_CALLBACK_URL,
  SAML_APP_CALLBACK_URL,
  APP_LOGOUT_URL,
  APP_INITIATE_LOGIN_URL,
  APP_LOGO_URI,
  DEMO_ORG_NAME,
  DEMO_ORG_DISPLAY_NAME,
  DEMO_ORG_LOGO_URI,
  DEMO_ORG_PRIMARY_COLOR,
  DEMO_ORG_BACKGROUND_COLOR,
  GOOGLE_CONNECTION_NAME,
  DEMO_ROLE_NAME_PREFIX,
  DEMO_CONNECTION_NAME,
  DEMO_RULE_NAME
} = require("../constants");

const getClientGrantId = async () => {
  const requestOptions = {
    path: `client-grants?client_id=${process.env.AUTH0_MGMT_CLIENT_ID}&audience=https://${process.env.AUTH0_DOMAIN}/api/v2/`
  };

  try {
    const response = await makeApi2Request(requestOptions);
    if (response && response.length === 1) {
      return response[0].id;
    }

    // TODO: Better error message
    throw new Error("Could not find client grant");
  } catch (error) {
    console.log(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const setRequiredClientGrant = async (clientGrantId) => {
  const requestOptions = {
    method: "patch",
    path: `client-grants/${clientGrantId}`,
    data: {
      scope: REQUIRED_SCOPES_FOR_BACKEND_CLIENT
    }
  };

  try {
    await makeApi2Request(requestOptions);
  } catch (error) {
    console.log(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const getAppClient = async () => {
  // TODO: Only works if less than 100 clients in a tenant
  const requestOptions = {
    path: "clients?page=0&per_page=100"
  };

  try {
    const response = await makeApi2Request(requestOptions);

    const matchingClient = response.filter(
      (client) => client.name === CLIENT_NAME_FOR_DEMO_APP
    );

    if (matchingClient.length === 0) {
      return;
    }

    return matchingClient[0];
  } catch (error) {
    console.log(error);
    console.error(`Error while getting demozero app client: ${error.message}`);
  }
};

const generateNewAppClient = async () => {
  const requestOptions = {
    method: "post",
    path: "clients",
    data: {
      name: CLIENT_NAME_FOR_DEMO_APP,
      description: "Created by orgs demo",
      callbacks: [APP_CALLBACK_URL],
      allowed_logout_urls: [APP_LOGOUT_URL],
      initiate_login_uri: APP_INITIATE_LOGIN_URL,
      logo_uri: APP_LOGO_URI,
      organization_usage: "allow",
      oidc_conformant: true,
      grant_types: ["authorization_code"]
    }
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    console.log(error);
    console.error(`Error while creating demo app client: ${error.message}`);
  }
};

const createAppClient = async () => {
  let appClient = await getAppClient();
  if (!appClient) {
    console.log("Demo app client does not exist. Creating...");
    appClient = await generateNewAppClient();
  }
  return appClient;
};

const getAppResourceServer = async () => {
  const requestOptions = {
    path: `resource-servers/${APP_RESOURCE_SERVER_IDENTIFIER}`
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    if (error.data.statusCode === 404) {
      // expected if the demo resource server is not already created
      return;
    }
    console.log(error);
    console.error(`Error while getting resource server: ${error.message}`);
  }
};

const generateNewAppResourceServer = async () => {
  const requestOptions = {
    method: "post",
    path: "resource-servers",
    data: {
      name: APP_RESOURCE_SERVER_IDENTIFIER,
      identifier: APP_RESOURCE_SERVER_IDENTIFIER,
      scopes: [
        { value: "create:foo", description: "create:foo" },
        { value: "read:foo", description: "read:foo" },
        { value: "update:foo", description: "update:foo" },
        { value: "delete:foo", description: "delete:foo" }
      ],
      enforce_policies: true,
      token_dialect: "access_token_authz",
      skip_consent_for_verifiable_first_party_clients: true,
      allow_offline_access: true
    }
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    console.log(error);
    console.error(
      `Error while creating demo resource server: ${error.message}`
    );
  }
};

const createAppResourceServer = async () => {
  let appResourceServer = await getAppResourceServer();
  if (!appResourceServer) {
    console.log("Demo app resource server does not exist. Creating...");
    appResourceServer = await generateNewAppResourceServer();
  }
  return appResourceServer;
};

const getDemoOrg = async () => {
  const requestOptions = {
    path: `organizations/name/${DEMO_ORG_NAME}`
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    if (error.data.statusCode === 404) {
      // expected if the demo org is not already created
      return;
    }
    console.log(error);
    console.error(`Error while getting demo org: ${error.message}`);
  }
};

const getGoogleConnectionId = async () => {
  const requestOptions = {
    path: "connections?page=0&per_page=100"
  };

  try {
    const response = await makeApi2Request(requestOptions);
    const googleConnection = response.filter(
      (connection) => connection.name === GOOGLE_CONNECTION_NAME
    );

    if (googleConnection.length === 0) {
      throw new Error(
        "Unable to create org. Google connection not found, so cannot enable the connection."
      );
    }

    return googleConnection[0].id;
  } catch (error) {
    console.log(error);
    console.error(`Error while google connection id: ${error.message}`);
  }
};

const generateNewDemoOrg = async (demoConnectionId) => {
  let requestOptions = {
    method: "post",
    path: "organizations",
    data: {
      name: DEMO_ORG_NAME,
      display_name: DEMO_ORG_DISPLAY_NAME,
      branding: {
        logo_url: DEMO_ORG_LOGO_URI,
        colors: {
          primary: DEMO_ORG_PRIMARY_COLOR,
          page_background: DEMO_ORG_BACKGROUND_COLOR
        }
      }
    }
  };

  try {
    const response = await makeApi2Request(requestOptions);
    const newOrgId = response.id;

    const googleConnectionId = await getGoogleConnectionId();

    requestOptions = {
      method: "post",
      path: `organizations/${newOrgId}/enabled_connections`,
      data: {
        connection_id: googleConnectionId,
        assign_membership_on_login: true
      }
    };
    await makeApi2Request(requestOptions);

    requestOptions = {
      method: "post",
      path: `organizations/${newOrgId}/enabled_connections`,
      data: {
        connection_id: demoConnectionId,
        assign_membership_on_login: false
      }
    };
    await makeApi2Request(requestOptions);
  } catch (error) {
    if (error.data.statusCode === 404) {
      // expected if the demo org is not already created
      return;
    }
    console.log(error);
    console.error(`Error while creating demo org: ${error.message}`);
  }
};

const createDemoOrg = async (demoConnectionId) => {
  let demoOrg = await getDemoOrg();
  if (!demoOrg) {
    console.log("Demo org does not exist. Creating... ");
    console.log(`Using connectionId ${demoConnectionId}`);
    demoOrg = await generateNewDemoOrg(demoConnectionId);
  }
  return demoOrg;
};

const getDemoRoles = async () => {
  const requestOptions = {
    path: `roles?name_filter=${DEMO_ROLE_NAME_PREFIX}`
  };

  try {
    const response = await makeApi2Request(requestOptions);

    if (response.length === 0) {
      return;
    }

    return response;
  } catch (error) {
    console.log(error);
    console.error(`Error while getting demo roles: ${error.message}`);
  }
};

const generateNewDemoRoles = async () => {
  try {
    const role1 = await createRole(`${DEMO_ROLE_NAME_PREFIX} 1`);
    const role2 = await createRole(`${DEMO_ROLE_NAME_PREFIX} 2`);

    await assignRolePermissions(role1.id);
    await assignRolePermissions(role2.id);

    return { role1, role2 };
  } catch (error) {
    console.log(error);
    console.error(`Error while generating roles: ${error.message}`);
  }
};

const createRole = async (roleName) => {
  const requestOptions = {
    method: "post",
    path: "roles",
    data: {
      name: roleName,
      description: roleName
    }
  };

  const createdRole = await makeApi2Request(requestOptions);
  return createdRole;
};

const assignRolePermissions = async (roleId) => {
  const requestOptions = {
    method: "post",
    path: `roles/${roleId}/permissions`,
    data: {
      permissions: [
        {
          resource_server_identifier: APP_RESOURCE_SERVER_IDENTIFIER,
          permission_name: "create:foo"
        },
        {
          resource_server_identifier: APP_RESOURCE_SERVER_IDENTIFIER,
          permission_name: "read:foo"
        },
        {
          resource_server_identifier: APP_RESOURCE_SERVER_IDENTIFIER,
          permission_name: "update:foo"
        },
        {
          resource_server_identifier: APP_RESOURCE_SERVER_IDENTIFIER,
          permission_name: "delete:foo"
        }
      ]
    }
  };

  await makeApi2Request(requestOptions);
};

const createDemoRoles = async () => {
  let demoRoles = await getDemoRoles();
  if (!demoRoles) {
    console.log("Demo roles do not exist. Creating...");
    demoRoles = await generateNewDemoRoles();
  }
  return demoRoles;
};

const generateNewDemoConnection = async () => {
  const requestOptions = {
    method: "post",
    path: "connections",
    data: {
      name: DEMO_CONNECTION_NAME,
      strategy: "auth0"
    }
  };

  const newConnection = await makeApi2Request(requestOptions);
  return newConnection;
};

const getDemoConnection = async () => {
  const requestOptions = {
    path: "connections"
  };

  const connections = await makeApi2Request(requestOptions);
  const demoConnection = connections.filter(
    (connection) => connection.name === DEMO_CONNECTION_NAME
  );
  if (demoConnection.length === 0) {
    return;
  }
  return demoConnection[0];
};

const createDemoConnection = async () => {
  let demoRoles = await getDemoConnection();
  if (!demoRoles) {
    console.log("Demo connection does not exist. Creating...");
    demoRoles = await generateNewDemoConnection();
  }
  return demoRoles;
};

const createSAMLAppClient = async () => {
  let appClient = await getSAMLAppClient();
  if (!appClient) {
    console.log("Demo SAML app client does not exist. Creating...");
    appClient = await generateNewSAMLAppClient();
  }
  return appClient;
};

const getSAMLAppClient = async () => {
  // TODO: Only works if less than 100 clients in a tenant
  // TODO: Make it generic, remove duplication with getAppClient
  const requestOptions = {
    path: "clients?page=0&per_page=100"
  };

  try {
    const response = await makeApi2Request(requestOptions);

    const matchingClient = response.filter(
      (client) => client.name === CLIENT_NAME_FOR_SAML_DEMO_APP
    );

    if (matchingClient.length === 0) {
      return;
    }

    return matchingClient[0];
  } catch (error) {
    console.log(error);
    console.error(`Error while getting SAML client: ${error.message}`);
  }
};

const generateNewSAMLAppClient = async () => {
  const requestOptions = {
    method: "post",
    path: "clients",
    data: {
      name: CLIENT_NAME_FOR_SAML_DEMO_APP,
      description: "Created by orgs demo",
      callbacks: [SAML_APP_CALLBACK_URL],
      allowed_logout_urls: [APP_LOGOUT_URL],
      initiate_login_uri: APP_INITIATE_LOGIN_URL,
      logo_uri: APP_LOGO_URI,
      organization_usage: "allow",
      oidc_conformant: true,
      addons: {
        samlp: {}
      }
    }
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    console.log(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const fetchSamlAppCert = async () => {
  const certUrl = `https://${process.env.AUTH0_DOMAIN}/rawpem`;
  const config = {
    method: "get",
    url: certUrl
  };

  const response = await axios(config);
  return response.data;
};

const createDemoRule = async () => {
  let demoRule = await getDemoRule();
  if (!demoRule) {
    console.log("Demo rule does not exist. Creating... ");
    demoRule = await generateNewDemoRule();
  }
  return demoRule;
};

const getDemoRule = async () => {
  // TODO: Only works if less than 100 rules in a tenant
  // TODO: We can make it generic with retrieving the other entities, I think
  const requestOptions = {
    path: "rules?page=0&per_page=100"
  };

  try {
    const response = await makeApi2Request(requestOptions);

    const matchingRule = response.filter(
      (rule) => rule.name === DEMO_RULE_NAME
    );

    if (matchingRule.length === 0) {
      return;
    }

    return matchingRule[0];
  } catch (error) {
    console.log(error);
    console.error(`Error while getting demo rule: ${error.message}`);
  }
};

const generateNewDemoRule = async () => {
  const requestOptions = {
    method: "post",
    path: "rules",
    data: {
      name: DEMO_RULE_NAME,
      order: 1,
      enabled: true,
      script:
        "function (user, context, callback) {\n    // add roles to tokens\n    const NAMESPACE = 'http://demozero.app';\n      context.idToken[`${NAMESPACE}/roles`] = context.authorization.roles;\n    context.accessToken[`${NAMESPACE}/roles`] = context.authorization.roles;\n    \n    // add org name to tokens\n      context.idToken[`${NAMESPACE}/org-name`] = context.organization && context.organization.name;\n    context.accessToken[`${NAMESPACE}/org-name`] = context.organization && context.organization.name;\n    return callback(null, user, context);\n  }"
    }
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    console.log(error);
    console.error(`Error while creating demo rule: ${error.message}`);
  }
};

module.exports = {
  getClientGrantId,
  setRequiredClientGrant,
  createAppClient,
  createAppResourceServer,
  createDemoOrg,
  createDemoRoles,
  createDemoConnection,
  createSAMLAppClient,
  fetchSamlAppCert,
  createDemoRule
};
