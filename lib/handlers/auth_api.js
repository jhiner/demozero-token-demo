const axios = require('axios');

const getUserInfo = async (accessToken) => {
  const config = {
    method: 'GET',
    url: `https://${process.env.AUTH0_DOMAIN}/userinfo`,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    json: true,
  };

  const response = await axios(config);
  return response.data;
};

const getRefreshToken = async (refreshToken) => {
  const config = {
    method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    data: {
      grant_type: 'refresh_token',
      client_id: `${process.env.AUTH0_CLIENT_ID}`,
      client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
      refresh_token: refreshToken,
      scope: `${process.env.SCOPES}`,
    },
    json: true,
  };

  const response = await axios(config);
  return response.data;
};

module.exports = {
  getUserInfo,
  getRefreshToken,
};
