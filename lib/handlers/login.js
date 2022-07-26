const { makeApi2Request } = require("../api2");
const { getEnv } = require("../env");
const _ = require("lodash");
const qs = require("qs");
const { APP_CALLBACK_URL } = require("../constants");
const { get } = require("lodash");

const authenticateWithOrganization = (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  console.log(
    `Calling /authorize with audience ${getEnv().audience} and scope ${
      getEnv().scope
    }`
  );
  console.log(req.query);
  let authorizeUrl = `https://${getEnv().AUTH0_DOMAIN}/authorize?`;
  authorizeUrl = `${authorizeUrl}client_id=${getEnv().APP_CLIENT_ID}`;
  authorizeUrl = `${authorizeUrl}&response_type=code`;
  authorizeUrl = `${authorizeUrl}&redirect_uri=${APP_CALLBACK_URL}`;
  authorizeUrl = `${authorizeUrl}&audience=${getEnv().audience}`;
  authorizeUrl = `${authorizeUrl}&scope=${getEnv().scope}`;
  authorizeUrl = `${authorizeUrl}&prompt=${getEnv().prompt}`;

  if (req.query.organization) {
    authorizeUrl = `${authorizeUrl}&organization=${req.query.organization}`;
  }

  if (getEnv().connection_name) {
    authorizeUrl = `${authorizeUrl}&connection=${getEnv().connection_name}`;
  }

  if (getEnv().login_hint) {
    authorizeUrl = `${authorizeUrl}&login_hint=${getEnv().login_hint}`;
  }

  const invitationId = req.query.invitation;
  if (invitationId) {
    authorizeUrl = `${authorizeUrl}&invitation=${invitationId}`;
  }

  res.redirect(authorizeUrl);
};

const parseOrgIdOrName = (reqBody) => {
  const orgNameAndId = (reqBody.organization_id || "").split("|");

  let organizationParam = orgNameAndId[0];
  if (reqBody.sendorgname === "on") {
    organizationParam = orgNameAndId[1];
  }

  return organizationParam;
};

const orgSelection = async (req, res) => {
  const organizationParam = parseOrgIdOrName(req.body);
  let params = _.omit(req.body, "organization_id");
  params.organization = organizationParam;
  res.redirect(`/login?${qs.stringify(params)}`);
};

const samlOrgSelection = async (req, res) => {
  const organizationParam = parseOrgIdOrName(req.body);
  res.redirect(`/saml/login?organization=${organizationParam}`);
};

const getOrganizations = async () => {
  const response = await makeApi2Request({
    method: "get",
    path: "organizations?page=0&per_page=100"
  });

  return response.map((organization) => ({
    name: organization.name,
    id: organization.id
  }));
};

const getConnections = async () => {
  const response = await makeApi2Request({
    method: "get",
    path: "connections?page=0&per_page=100"
  });

  return response.map((connection) => ({
    name: connection.name,
    id: connection.id,
    strategy: connection.strategy
  }));
};

const getRoles = async () => {
  const response = await makeApi2Request({
    method: "get",
    path: "roles?page=0&per_page=100"
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
