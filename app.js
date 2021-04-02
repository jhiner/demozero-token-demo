const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const flash = require('req-flash');
const bodyParser = require('body-parser');
const { APP_CALLBACK_URL } = require('./lib/constants');
const { getEnv } = require('./lib/env');
const routes = require('./routes/index');
const user = require('./routes/user');

// This will configure Passport to use Auth0
const strategy = new Auth0Strategy(
  {
    domain: getEnv().AUTH0_DOMAIN,
    clientID: getEnv().APP_CLIENT_ID,
    clientSecret: getEnv().APP_CLIENT_SECRET,
    callbackURL: APP_CALLBACK_URL,
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the JWT access token
    // extraParams.id_token is the JWT id token
    // profile has all the information from the user
    extraParams.refresh_token = refreshToken;

    return done(null, {
      profile: profile,
      extraParams: extraParams,
    });
  }
);

passport.use(strategy);

// you can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view options', { pretty: true });

app.use(logger('dev'));
app.use(
  session({
    secret: 'yourSessionSecret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function authErrorHandler(req, res, next) {
  if (req && req.query && req.query.error) {
    req.flash('error', req.query.error);
  }
  if (req && req.query && req.query.error_description) {
    req.flash('error_description', req.query.error_description);
  }
  next();
});

app.use('/', routes);
app.use('/user', user);

app.use(function catch404Error(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function devErrorHandler(err, req, res, next) {
    // TODO: A better way to output diagnostic info in the console
    console.log(err.data);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

app.use(function prodErrorHandler(err, req, res, next) {
  // TODO: What makes to log in production?
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

module.exports = app;
