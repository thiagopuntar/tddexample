module.exports = class InvalidDataError extends Error {
  constructor(data) {
    super(`Invalid data ${data}`);
  }
};
