module.exports = class AgencyService {
  constructor(agencyRepository) {
    this.agencyRepository = agencyRepository;
  }

  // eslint-disable-next-line class-methods-use-this
  validate(body) {
    const { license, name } = body;
    if (!license) {
      return 'license is required.';
    }

    if (!name) {
      return 'name is required.';
    }

    return null;
  }

  async findValidAgencyByLicense(license) {
    const agency = await this.agencyRepository.findByLicense(license);
    if (!agency) {
      return null;
    }

    if (agency.status === 'ACTIVE' && agency.isFromTokio) {
      return agency;
    }

    if (agency.status === 'PENDING' && agency.isFromTokio && agency.broker.status) {
      return agency;
    }

    if (agency.status === 'PENDING' && agency.isFromTokio && agency.broker.id === 0) {
      return agency;
    }

    if (agency.status === 'WAITING') {
      await this.agencyRepository.deleteAgency(agency.id);
    }

    return null;
  }

  async createAgencyAtBroker() {
    return this;
  }

  async saveAgency() {
    return this;
  }
};
