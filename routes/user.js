const express = require('express');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();
const request = require('request');
const jwtDecode = require('jwt-decode');
const _ = require('lodash');

let apiData;

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {

  const decodedIDToken = jwtDecode(req.user.extraParams.id_token);
  const decodedAccessToken = jwtDecode(req.user.extraParams.access_token);

  res.render('user', {
    user: req.user,
    decodedIDToken,
    decodedAccessToken,
    apiData: apiData,
    title: 'Fake SaaS App'
  });

  apiData = '';
});

router.get('/refresh', ensureLoggedIn, function(req, res, next) {
  // get refresh token
  getRefreshToken(req, function (error, response, body) {
    req.user.extraParams.id_token = body.id_token;
    req.user.extraParams.access_token = body.access_token;
    return res.redirect('/user');
  });
});


router.get('/userinfo', ensureLoggedIn, function(req, res, next) {
  getUserInfo(req, function (error, response, body) {
    if (error) return next(error);
    apiData = body;
    return res.redirect('/user');
  });
});

function getUserInfo(req, cb) {
  var options = { method: 'GET',
    url: `https://${process.env.AUTH0_DOMAIN}/userinfo`,
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + req.user.extraParams.access_token
    },
    json: true
  };

  return request(options, cb);
}

function getRefreshToken(req, cb) {

  // get refresh token
  var options = { method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: {
      grant_type: 'refresh_token',
      client_id: `${process.env.AUTH0_CLIENT_ID}`,
      client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
      refresh_token: req.user.extraParams.refresh_token,
      redirect_uri: `${process.env.AUTH0_CALLBACK_URL}`,
      scope: `${process.env.SCOPES}`
    },
    json: true
  };

  return request(options, cb);
}

module.exports = router;
