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

    return { status: 400 }
  }
}

module.exports = AgencyController