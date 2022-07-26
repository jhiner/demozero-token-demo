const dotenv = require("dotenv");

dotenv.config();

const API2_BASE_URL = `https://${process.env.AUTH0_DOMAIN}/api/v2/`;
const API2_AUDIENCE = API2_BASE_URL;
const AUTH_REQUESTED_SCOPES =
  "openid email profile create:foo read:foo update:foo delete:foo offline_access";
const USERINFO_ENDPOINT = `https://${process.env.AUTH0_DOMAIN}/userinfo`;
const USERINFO_AUDIENCE = USERINFO_ENDPOINT;
const TOKEN_ENDPOINT = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;

const REQUIRED_SCOPES_FOR_BACKEND_CLIENT = [
  "create:clients",
  "read:client_grants",
  "update:client_grants",
  "read:clients",
  "delete:clients",
  "read:client_keys",
  "create:connections",
  "read:connections",
  "delete:connections",
  "create:roles",
  "delete:roles",
  "update:roles",
  "read:roles",
  "read:users",
  "delete:users",
  "create:organization_invitations",
  "create:organizations",
  "read:organizations",
  "delete:organizations",
  "create:organization_connections",
  "create:organization_members",
  "update:prompts",
  "create:resource_servers",
  "read:resource_servers",
  "delete:resource_servers",
  "create:rules",
  "read:rules",
  "delete:rules"
];
const APP_RESOURCE_SERVER_IDENTIFIER = "urn:demozero-saas-api";

// CLIENT SETTINGS
// TODO: Make these dynamic e.g. retrieve port
const APP_CALLBACK_URL = "https://myapp.com:4000/callback";
const SAML_APP_CALLBACK_URL = "https://myapp.com:4000/saml/callback";
const APP_LOGOUT_URL = "https://myapp.com:4000/logout";
const APP_INITIATE_LOGIN_URL = "https://myapp.com:4000/login";
const CLIENT_NAME_FOR_DEMO_APP = "Demozero App";
const CLIENT_NAME_FOR_SAML_DEMO_APP = "Demozero SAML App";
const APP_LOGO_URI = "https://static.thenounproject.com/png/66350-200.png";

// ORG SETTINGS
const DEMO_ORG_LOGO_URI =
  "https://www.logopik.com/wp-content/uploads/edd/2018/08/Acme-Logo.png";
const DEMO_ORG_BACKGROUND_COLOR = "#777775";
const DEMO_ORG_PRIMARY_COLOR = "#ff0033";
const DEMO_ORG_NAME = "acme";
const DEMO_ORG_DISPLAY_NAME = "Acme, Inc.";
const GOOGLE_CONNECTION_NAME = "google-oauth2";
const DEMO_CONNECTION_NAME = "demo-org-db-connection";

// ROLES
const DEMO_ROLE_NAME_PREFIX = "Demozero SaaS Role";

// RULES
const DEMO_RULE_NAME = "Demozero-Rule";

module.exports = {
  API2_BASE_URL,
  API2_AUDIENCE,
  AUTH_REQUESTED_SCOPES,
  USERINFO_ENDPOINT,
  USERINFO_AUDIENCE,
  TOKEN_ENDPOINT,
  REQUIRED_SCOPES_FOR_BACKEND_CLIENT,
  APP_RESOURCE_SERVER_IDENTIFIER,
  APP_CALLBACK_URL,
  APP_LOGOUT_URL,
  APP_INITIATE_LOGIN_URL,
  CLIENT_NAME_FOR_DEMO_APP,
  APP_LOGO_URI,
  DEMO_ORG_LOGO_URI,
  DEMO_ORG_BACKGROUND_COLOR,
  DEMO_ORG_PRIMARY_COLOR,
  DEMO_ORG_NAME,
  DEMO_ORG_DISPLAY_NAME,
  GOOGLE_CONNECTION_NAME,
  DEMO_ROLE_NAME_PREFIX,
  DEMO_CONNECTION_NAME,
  CLIENT_NAME_FOR_SAML_DEMO_APP,
  SAML_APP_CALLBACK_URL,
  DEMO_RULE_NAME
};
