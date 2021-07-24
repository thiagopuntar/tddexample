const BrokerError = require('../helpers/errors/BrokerError');
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
    const [existentAgency] = await this.agencyService.findAgencyByLicense(license);
    if (existentAgency) {
      const reasonItCantCreate = await this.agencyService.checkIfCanCreate(existentAgency);

      if (reasonItCantCreate) {
        throw new ExistentAgencyError(license, reasonItCantCreate);
      }
      await this.agencyService.deleteOrMigrate(existentAgency);
    }

    let brokerResponse;
    try {
      brokerResponse = await this.agencyService.createAgencyAtBroker(req.body);
    } catch (error) {
      throw new BrokerError(error.message);
    }

    await this.agencyService.saveAgency(req.body, brokerResponse);

    return { status: 400 };
  }
}

module.exports = AgencyController;
