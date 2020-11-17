const express = require('express');
const passport = require('passport');
const router = express.Router();
const handlers = require('../lib/handlers');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { authenticateWithOrganization, orgSelection, getOrganizations, getRoles } = handlers.login;
const { inviteFlow } = handlers.invite;

router.get('/', async function (req, res, next) {
  const organizations = await getOrganizations();
  const roles = await getRoles();
  res.render('index', { title: 'Fake SaaS App', organizations, roles });
});

router.get('/login', authenticateWithOrganization);

router.post('/invite', inviteFlow);

router.post('/orgselect', orgSelection);

router.get('/diag', (req, res) => {
  res.json({
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET.substr(0, 3) + '...',
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL,
    LOGOUT_URL: process.env.LOGOUT_URL,
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

router.get(
  '/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/error',
  }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/user');
  }
);

router.get('/error', (req, res) => {
  var error = req.flash('error');
  var error_description = req.flash('error_description');
  req.logout();
  res.render('error', {
    error: error,
    error_description: error_description,
  });
});

router.get('/unauthorized', (req, res) => {
  res.render('unauthorized');
});

module.exports = router;
