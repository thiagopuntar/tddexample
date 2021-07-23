const ExistentAgencyError = require('../helpers/errors/ExistentAgencyError');
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
    const { status, isFromTokio, broker } = existentAgency;
    if (status === 'ACTIVE' && isFromTokio) {
      throw new ExistentAgencyError(license);
    }

    if (status === 'PENDING' && isFromTokio && broker.status) {
      throw new ExistentAgencyError(license);
    }

    if (status === 'PENDING' && broker.id === 0) {
      throw new ExistentAgencyError(license);
    }

    if (status === 'WAITING') {
      await this.agencyRepository.delete(existentAgency.id);
    }

    return { status: 400 };
  }
}

module.exports = AgencyController;
