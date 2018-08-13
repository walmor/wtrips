function CustomError(message) {
  this.message = message;
}

CustomError.prototype = Object.create(Error.prototype);
CustomError.prototype.name = 'CustomError';

export default CustomError;
