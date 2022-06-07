const { USERINFO_ENDPOINT, TOKEN_ENDPOINT, AUTH_REQUESTED_SCOPES } = require('../constants');
const { getEnv } = require('../env');

const axios = require('axios');

const getUserInfo = async (accessToken) => {
  const config = {
    method: 'GET',
    url: USERINFO_ENDPOINT,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    json: true
  };

  const response = await axios(config);
  return response.data;
};

const getRefreshToken = async (refreshToken) => {
  const config = {
    method: 'POST',
    url: TOKEN_ENDPOINT,
    headers: { 'content-type': 'application/json' },
    data: {
      grant_type: 'refresh_token',
      client_id: `${getEnv().APP_CLIENT_ID}`,
      client_secret: `${getEnv().APP_CLIENT_SECRET}`,
      refresh_token: refreshToken,
      scope: getEnv().scope
    },
    json: true
  };

  const response = await axios(config);
  return response.data;
};

module.exports = {
  getUserInfo,
  getRefreshToken
};
