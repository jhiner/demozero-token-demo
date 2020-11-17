const axios = require('axios');

const getToken = async () => {
  const tokenRequest = {
    client_id: process.env.AUTH0_MGMT_CLIENT_ID,
    client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
    grant_type: 'client_credentials',
    audience: 'https://saas-provider.local.dev.auth0.com/api/v2/',
  };
  const config = {
    method: 'POST',
    url: `https://saas-provider.local.dev.auth0.com/oauth/token`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(tokenRequest),
  };

  const response = await axios(config);
  return response.data.access_token;
};

module.exports = {
  getToken
}