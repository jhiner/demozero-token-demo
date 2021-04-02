const axios = require('axios');

const { API2_BASE_URL, TOKEN_ENDPOINT, API2_AUDIENCE } = require('./constants');

const getToken = async () => {
  const tokenRequest = {
    client_id: process.env.AUTH0_MGMT_CLIENT_ID,
    client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
    grant_type: 'client_credentials',
    audience: API2_AUDIENCE,
  };
  const config = {
    method: 'post',
    url: TOKEN_ENDPOINT,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(tokenRequest),
  };

  const response = await axios(config);
  return response.data.access_token;
};

const makeApi2Request = async (options) => {
  try {
    const api2Token = await getToken();

    const method = (options && options.method && options.method.toLowerCase()) || 'get';

    const config = {
      method,
      url: `${API2_BASE_URL}${options.path}`,
      headers: {
        Authorization: `Bearer ${api2Token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(options.data),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    const api2Error = new Error(error.message);
    if (error.response) {
      api2Error.data = error.response.data;
    }

    throw api2Error;
  }
};

module.exports = {
  getToken,
  makeApi2Request,
};
