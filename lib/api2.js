const axios = require('axios');

const getToken = async () => {
  const tokenRequest = {
    client_id: process.env.AUTH0_MGMT_CLIENT_ID,
    client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
    grant_type: 'client_credentials',
    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
  };
  const config = {
    method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
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