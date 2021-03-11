const axios = require('axios');

const { getToken } = require('../api2');

const authenticateWithOrganization = (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  let authorizeUrl = `https://${process.env.AUTH0_DOMAIN}/authorize?`;
  authorizeUrl = `${authorizeUrl}client_id=${process.env.AUTH0_CLIENT_ID}`;
  authorizeUrl = `${authorizeUrl}&response_type=code`;
  authorizeUrl = `${authorizeUrl}&redirect_uri=${process.env.AUTH0_CALLBACK_URL}`;
  authorizeUrl = `${authorizeUrl}&audience=${process.env.API_IDENTIFIER}`;
  authorizeUrl = `${authorizeUrl}&scope=${process.env.SCOPES}`;

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
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/organizations?page=0&per_page=100`;
  const token = await getToken();
  const config = {
    method: 'get',
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios(config);
  return response.data.map((organization) => ({
    name: organization.name,
    id: organization.id,
  }));
};

const getConnections = async () => {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/connections?page=0&per_page=100`;
  const token = await getToken();
  const config = {
    method: 'get',
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios(config);
  return response.data.map((connection) => ({
    name: connection.name,
    id: connection.id,
    strategy: connection.strategy,
  }));
};

const getRoles = async () => {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/roles?page=0&per_page=100`;
  const token = await getToken();
  const config = {
    method: 'get',
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios(config);
  return response.data.map((role) => ({
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
