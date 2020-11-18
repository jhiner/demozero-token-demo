const { getToken } = require('../api2');

const axios = require('axios');

const deleteTestUsers = async (email) => {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/users?q=email:"${email}"&search_engine=v3`;
  const token = await getToken();
  const config = {
    method: 'get',
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios(config);
  const userIds = response.data.map((user) => user.user_id);
  for (let userId of userIds) {
    await deleteSingleUser(userId);
  }
};

const deleteSingleUser = async (userId) => {
  const token = await getToken();
  const config = {
    method: 'delete',
    url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  await axios(config);
};

const inviteFlow = async (req, res, next) => {
  // TODO: We should validate these instead of directly passing them to the backend
  const email = req.body.email;
  const organizationId = req.body.organization_id;
  const roleId = req.body.role_id;

  try {
    const api2Token = await getToken();

    const inviteRequest = {
      client_id: process.env.AUTH0_CLIENT_ID,
      invitee: { email },
      inviter: { name: 'John Doe' },
      app_metadata: {
        source: 'Invited via test app',
      },
      roles: [roleId],
    };

    await deleteTestUsers(email);

    const config = {
      method: 'POST',
      url: `https://${process.env.AUTH0_DOMAIN}/api/v2/organizations/${organizationId}/invitations`,
      headers: {
        Authorization: `Bearer ${api2Token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(inviteRequest),
    };

    const response = await axios(config);
    const invitationAppUrl = response.data.invitation_url;
    console.log(`Will redirect to ${invitationAppUrl}`);
    res.redirect(invitationAppUrl);
  } catch (error) {
    const errorResponse = error.response || {};
    console.log(errorResponse.data);
    return next(error);
  }
};

module.exports = {
  inviteFlow,
};
