const express = require("express");
const path = require("path");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const SamlStrategy = require("passport-wsfed-saml2").Strategy;
const flash = require("req-flash");
const bodyParser = require("body-parser");
const { APP_CALLBACK_URL } = require("./lib/constants");
const { getEnv } = require("./lib/env");
const routes = require("./routes/index");
const user = require("./routes/user");

const auth0Strategy = new Auth0Strategy(
  {
    domain: getEnv().AUTH0_DOMAIN,
    clientID: getEnv().APP_CLIENT_ID,
    clientSecret: getEnv().APP_CLIENT_SECRET,
    callbackURL: APP_CALLBACK_URL
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    extraParams.refresh_token = refreshToken;

    return done(null, {
      profile: profile,
      extraParams: extraParams
    });
  }
);

const samlStrategy = new SamlStrategy(
  {
    protocol: "samlp",
    realm: "urn:test-app",
    path: "/saml/callback",
    identityProviderUrl: `https://${getEnv().AUTH0_DOMAIN}/samlp/${
      getEnv().SAML_APP_CLIENT_ID
    }`,
    cert: getEnv().SAML_CERT
  },
  (profile, done) => {
    return done(null, {
      profile: profile
    });
  }
);

passport.use(auth0Strategy);
passport.use(samlStrategy);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.set("view options", { pretty: true });

app.use(logger("dev"));
app.use(
  session({
    secret: "yourSessionSecret",
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.use(function authErrorHandler(req, res, next) {
  if (req && req.query && req.query.error) {
    req.flash("error", req.query.error);
  }
  if (req && req.query && req.query.error_description) {
    req.flash("error_description", req.query.error_description);
  }
  next();
});

app.use("/", routes);
app.use("/user", user);

app.use(function catch404Error(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

if (app.get("env") === "development") {
  app.use(function devErrorHandler(err, req, res, next) {
    // TODO: A better way to output diagnostic info in the console
    console.log(err.data);
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

app.use(function prodErrorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});

module.exports = app;
