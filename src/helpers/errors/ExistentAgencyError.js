module.exports = class ExistentAgencyError extends Error {
  constructor(license, status) {
    super(`There's already an agency registered with license ${license} and status ${status}`);
  }
};
