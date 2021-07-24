const InvalidDataError = require('../helpers/errors/InvalidDataError');

class AgencyController {
  constructor(agencyService, agencyRepository) {
    this.agencyService = agencyService;
    this.agencyRepository = agencyRepository;
  }

  async create(req) {
    const invalidData = this.agencyService.validate(req.body);
    if (invalidData) {
      throw new InvalidDataError(invalidData);
    }

    const { license } = req.body;
    const [existentAgency = {}] = await this.agencyService.findAgencyByLicense(license);
    await this.agencyService.checkIfCanCreate(existentAgency);

    return { status: 400 };
  }
}

module.exports = AgencyController;
