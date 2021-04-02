const { makeApi2Request } = require('../api2');
const { getEnv } = require('../env');
const { AUTH_REQUESTED_SCOPES, APP_RESOURCE_SERVER_IDENTIFIER, APP_CALLBACK_URL } = require('../constants');

const authenticateWithOrganization = (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  let authorizeUrl = `https://${getEnv().AUTH0_DOMAIN}/authorize?`;
  authorizeUrl = `${authorizeUrl}client_id=${getEnv().APP_CLIENT_ID}`;
  authorizeUrl = `${authorizeUrl}&response_type=code`;
  authorizeUrl = `${authorizeUrl}&redirect_uri=${APP_CALLBACK_URL}`;
  authorizeUrl = `${authorizeUrl}&audience=${APP_RESOURCE_SERVER_IDENTIFIER}`;
  authorizeUrl = `${authorizeUrl}&scope=${AUTH_REQUESTED_SCOPES}`;

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

const getOrganizations = async () => {
  const response = await makeApi2Request({
    method: 'get',
    path: 'organizations?page=0&per_page=100',
  });

  return response.map((organization) => ({
    name: organization.name,
    id: organization.id,
  }));
};

const getConnections = async () => {
  const response = await makeApi2Request({
    method: 'get',
    path: 'connections?page=0&per_page=100',
  });

  return response.map((connection) => ({
    name: connection.name,
    id: connection.id,
    strategy: connection.strategy,
  }));
};

const getRoles = async () => {
  const response = await makeApi2Request({
    method: 'get',
    path: 'roles?page=0&per_page=100',
  });

  return response.map((role) => ({
    name: role.name,
    id: role.id,
  }));
};

module.exports = {
  authenticateWithOrganization,
  orgSelection,
  getOrganizations,
  getRoles,
  getConnections,
};
