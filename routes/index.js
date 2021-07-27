const express = require('express');
const passport = require('passport');
const router = express.Router();
const handlers = require('../lib/handlers');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { authenticateWithOrganization, samlOrgSelection, orgSelection, getOrganizations, getRoles, getConnections } = handlers.login;
const { inviteFlow } = handlers.invite;
const { getEnv } = require('../lib/env');
const { APP_RESOURCE_SERVER_IDENTIFIER, USERINFO_AUDIENCE, API2_AUDIENCE } = require('../lib/constants');

const { saveConfiguration } = handlers.configuration;

router.get('/', async function (req, res, next) {
  try {
    const organizations = await getOrganizations();
    const roles = await getRoles();
    const connections = await getConnections();
    const audienceList = [APP_RESOURCE_SERVER_IDENTIFIER, USERINFO_AUDIENCE, API2_AUDIENCE];

    res.render('index', { title: 'Fake SaaS App', organizations, roles, connections, selectedAudience: getEnv().audience, audienceList, scope: getEnv().scope });
  } catch (error) {
    return next(error);
  }
});

router.get('/login', authenticateWithOrganization);
router.post('/invite', inviteFlow);
router.post('/orgselect', orgSelection);

router.post('/saml/orgselect', samlOrgSelection);
router.get('/saml/login', (req, res) => {
  const passportOptions = { failureRedirect: '/error', failureFlash: true };
  if (req.query.organization) {
    // TODO: Update passport-saml-wsfed lib to optional pass this
    passportOptions.organization = req.query.organization;
  }
  passport.authenticate('wsfed-saml2', passportOptions)(req, res);
});

router.get('/diag', (req, res) => {
  res.json({
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET.substr(0, 3) + '...',
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL,
    LOGOUT_URL: process.env.LOGOUT_URL
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/loggedOut', (req, res) => {
  res.json({ status: 'logged out' });
});

router.post('/callback', (req, res) => {
  res.redirect(req.session.returnTo || '/user');
});

router.post('/saml/callback', passport.authenticate('wsfed-saml2', { failureRedirect: '/error', failureFlash: true }), (req, res) => {
  res.redirect('/user/saml');
});

router.get(
  '/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/error'
  }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/user');
  }
);

router.get('/error', (req, res) => {
  const error = req.flash('error');
  const error_description = req.flash('error_description');

  req.logout();
  res.render('error', {
    error: error,
    error_description: error_description
  });
});

router.get('/unauthorized', (req, res) => {
  res.render('unauthorized');
});

router.post('/saveconfiguration', saveConfiguration);

module.exports = router;
