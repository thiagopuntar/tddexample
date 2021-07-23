const ExistentAgencyError = require('../helpers/errors/ExistentAgencyError')
const InvalidDataError = require('../helpers/errors/InvalidDataError')

class AgencyController {
  constructor(agencyService) {
    this.agencyService = agencyService
  }

  async create(req, res) {
    const invalidData = this.agencyService.validate(req.body)
    if (invalidData) {
      throw new InvalidDataError(invalidData)
    }

    const [existentAgency] = await this.agencyService.findAgencyByLicense(req.body.license)
    if (existentAgency.status === 'ACTIVE' && existentAgency.isFromTokio) {
      throw new ExistentAgencyError(req.body.license)
    }

    return { status: 400 }
  }
}

module.exports = AgencyController