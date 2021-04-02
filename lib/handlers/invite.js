const { makeApi2Request } = require('../api2');
const { getEnv } = require('../env');

const deleteTestUsers = async (email) => {
  const requestOptions = {
    path: `users?q=email:"${email}"&search_engine=v3`,
  };

  const response = await makeApi2Request(requestOptions);
  const userIds = response.map((user) => user.user_id);
  for (let userId of userIds) {
    await deleteSingleUser(userId);
  }
};

const deleteSingleUser = async (userId) => {
  const requestOptions = {
    method: 'delete',
    path: `users/${userId}`,
  };

  await makeApi2Request(requestOptions);
};

const inviteFlow = async (req, res, next) => {
  // TODO: We should validate these instead of directly passing them to the backend
  const email = req.body.email;
  const organizationId = req.body.organization_id;
  const roleId = req.body.role_id;
  const connectionId = req.body.connection_id;

  try {
    const inviteRequest = {
      client_id: getEnv().APP_CLIENT_ID,
      invitee: { email },
      inviter: { name: 'John Doe' },
      app_metadata: {
        source: 'Invited via test app',
      },
      roles: [roleId],
    };

    if (connectionId !== 'not-specified') {
      inviteRequest.connection_id = connectionId;
    }

    await deleteTestUsers(email);

    const requestOptions = {
      method: 'post',
      path: `organizations/${organizationId}/invitations`,
      data: inviteRequest,
    };

    const response = await makeApi2Request(requestOptions);

    const invitationAppUrl = response.invitation_url;
    console.log(`Will redirect to ${invitationAppUrl}`);
    res.redirect(invitationAppUrl);
  } catch (error) {
    console.log('Error while creating invitation: ');
    console.log(error);
    return next(error);
  }
};

module.exports = {
  inviteFlow,
};
