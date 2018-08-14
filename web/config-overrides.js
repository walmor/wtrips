const rewireMobX = require('react-app-rewire-mobx');

module.exports = function override(config, env) {
  // eslint-disable-next-line no-param-reassign
  config = rewireMobX(config, env);
  return config;
};
