module.exports = class ExistentAgencyError extends Error {
  constructor(license) {
    super(`There's already an agency registered with license ${license}.`)
  }
}