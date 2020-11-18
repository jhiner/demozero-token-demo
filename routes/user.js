const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();
const jwtDecode = require('jwt-decode');

const { getUserInfo, getRefreshToken } = require('../lib/handlers/auth_api');

router.get('/', ensureLoggedIn, (req, res, next) => {
  renderUserPage(req, res);
});

router.get('/refresh', ensureLoggedIn, async (req, res, next) => {
  const refreshTokenResponse = await getRefreshToken(req.user.extraParams.refresh_token);

  renderUserPage(req, res, {
    idToken: refreshTokenResponse.id_token,
    accessToken: refreshTokenResponse.access_token,
  });
});

router.get('/userinfo', ensureLoggedIn, async (req, res, next) => {
  const userinfoResponse = await getUserInfo(req.user.extraParams.access_token);

  renderUserPage(req, res, { userinfoResponse });
});

const renderUserPage = (req, res, data = {}) => {
  const idToken = data.idToken || req.user.extraParams.id_token;
  const accessToken = data.accessToken || req.user.extraParams.access_token;

  const decodedIDToken = jwtDecode(idToken);
  const decodedAccessToken = jwtDecode(accessToken);

  res.render('user', {
    user: req.user,
    decodedIDToken,
    decodedAccessToken,
    userinfoResponse: data.userinfoResponse,
    title: 'Fake SaaS App',
    tokens: {
      refresh_token: req.user.extraParams.refresh_token,
      id_token: idToken,
      access_token: accessToken,
    },
  });
};

module.exports = router;
