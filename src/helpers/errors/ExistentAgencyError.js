module.exports = class ExistentAgencyError extends Error {
  constructor(license, reason = '') {
    super(`There's already an agency registered with license ${license}. ${reason}`);
  }
};
