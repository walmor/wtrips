function ApiClientError(message, handled = false, errors) {
  this.message = message;
  this.handled = handled;
  this.errors = errors;
}

ApiClientError.prototype = Object.create(Error.prototype);
ApiClientError.prototype.name = 'ApiClientError';

export default ApiClientError;
