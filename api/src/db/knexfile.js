import config from '../config';

module.exports = Object.assign({}, config.knex, {
  // The convertion to/from snake case cannot be used in migrations.
  // See https://vincit.github.io/objection.js/#snake-case-to-camel-case-conversion
  postProcessResponse: undefined,
  wrapIdentifier: undefined,
});
