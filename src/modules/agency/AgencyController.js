const BrokerError = require('../../helpers/errors/BrokerError');
const ExistentAgencyError = require('../../helpers/errors/ExistentAgencyError');
const InvalidDataError = require('../../helpers/errors/InvalidDataError');

class AgencyController {
  constructor(agencyService, agencyRepository) {
    this.agencyService = agencyService;
    this.agencyRepository = agencyRepository;
  }

  async create(req, res) {
    const invalidData = this.agencyService.validate(req.body);
    if (invalidData) {
      throw new InvalidDataError(invalidData);
    }

    const { license } = req.body;
    const existentAgency = await this.agencyService.findValidAgencyByLicense(license);
    if (existentAgency) {
      throw new ExistentAgencyError(license, existentAgency.status);
    }

    let brokerResponse;
    try {
      brokerResponse = await this.agencyService.createAgencyAtBroker(req.body);
    } catch (error) {
      throw new BrokerError(error.message);
    }

    await this.agencyService.saveAgency(req.body, brokerResponse);

    res.status(201).send(brokerResponse);
  }
}

module.exports = AgencyController;
