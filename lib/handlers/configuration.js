const { makeApi2Request } = require('../api2');
const { setEnv } = require('../env');
const _ = require('lodash');

const ALLOWED_CONFIGURATION_PARAMS = ['audience', 'scope', 'prompt', 'login_hint', 'connection_name'];

const saveConfiguration = (req, res) => {
  const updatedConfiguration = _.pick(req.body, ALLOWED_CONFIGURATION_PARAMS);
  Object.keys(updatedConfiguration).forEach((configurationKey) => setEnv(configurationKey, updatedConfiguration[configurationKey]));
  res.redirect('/');
};

module.exports = {
  saveConfiguration
};
