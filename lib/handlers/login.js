const { makeApi2Request } = require('../api2');
const { getEnv } = require('../env');
const { APP_CALLBACK_URL } = require('../constants');

const authenticateWithOrganization = (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  console.log(`Calling /authorize with audience ${getEnv().audience} and scope ${getEnv().scope}`);
  let authorizeUrl = `https://${getEnv().AUTH0_DOMAIN}/authorize?`;
  authorizeUrl = `${authorizeUrl}client_id=${getEnv().APP_CLIENT_ID}`;
  authorizeUrl = `${authorizeUrl}&response_type=code`;
  authorizeUrl = `${authorizeUrl}&redirect_uri=${APP_CALLBACK_URL}`;
  authorizeUrl = `${authorizeUrl}&audience=${getEnv().audience}`;
  authorizeUrl = `${authorizeUrl}&scope=${getEnv().scope}`;

  if (req.query.organization) {
    authorizeUrl = `${authorizeUrl}&organization=${req.query.organization}`;
  }

  const invitationId = req.query.invitation;
  if (invitationId) {
    authorizeUrl = `${authorizeUrl}&invitation=${invitationId}`;
  }

  res.redirect(authorizeUrl);
};

const orgSelection = async (req, res, next) => {
  const organizationId = req.body.organization_id;
  res.redirect(`/login?organization=${organizationId}`);
};

const samlOrgSelection = async (req, res, next) => {
  const organizationId = req.body.organization_id;
  res.redirect(`/saml/login?organization=${organizationId}`);
};

const getOrganizations = async () => {
  const response = await makeApi2Request({
    method: 'get',
    path: 'organizations?page=0&per_page=100'
  });

  return response.map((organization) => ({
    name: organization.name,
    id: organization.id
  }));
};

const getConnections = async () => {
  const response = await makeApi2Request({
    method: 'get',
    path: 'connections?page=0&per_page=100'
  });

  return response.map((connection) => ({
    name: connection.name,
    id: connection.id,
    strategy: connection.strategy
  }));
};

const getRoles = async () => {
  const response = await makeApi2Request({
    method: 'get',
    path: 'roles?page=0&per_page=100'
  });

  return response.map((role) => ({
    name: role.name,
    id: role.id
  }));
};

module.exports = {
  authenticateWithOrganization,
  orgSelection,
  getOrganizations,
  getRoles,
  getConnections,
  samlOrgSelection
};
