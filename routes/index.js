const express = require('express');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();
const request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Fake SaaS App' });
});

const authenticateWithOrganization = (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  let authorizeUrl = `https://${process.env.AUTH0_DOMAIN}/authorize?`;
  authorizeUrl = `${authorizeUrl}client_id=${process.env.AUTH0_CLIENT_ID}`;
  authorizeUrl = `${authorizeUrl}&response_type=code`;
  authorizeUrl = `${authorizeUrl}&redirect_uri=${process.env.AUTH0_CALLBACK_URL}`;
  authorizeUrl = `${authorizeUrl}&audience=${process.env.API_IDENTIFIER}`;
  authorizeUrl = `${authorizeUrl}&scope=${process.env.SCOPES}`;

  if (req.query.organization) {
      authorizeUrl = `${authorizeUrl}&organization=${req.query.organization}`;
  }

  res.redirect(authorizeUrl);
}

router.get('/login', authenticateWithOrganization);

router.get('/diag', function(req, res) {
  res.json({
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET.substr(0, 3) + '...',
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL,
    LOGOUT_URL: process.env.LOGOUT_URL
  });
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/loggedOut', function(req, res){
  res.json({status: 'logged out'});
});

router.post('/callback', function(req, res) {
  res.redirect(req.session.returnTo || '/user');
});

router.get('/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/error',
  }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/user');
  }
);

router.get('/error', function(req, res) {
  var error = req.flash('error');
  var error_description = req.flash('error_description');
  req.logout();
  res.render('error', {
    error: error,
    error_description: error_description
  });
});

router.get('/unauthorized', function(req, res) {
  res.render('unauthorized');
});


module.exports = router;
