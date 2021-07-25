module.exports = class AgencyService {
  constructor(agencyRepository) {
    this.agencyRepository = agencyRepository;
  }

  // eslint-disable-next-line class-methods-use-this
  validate(body = {}) {
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

    const { status, isFromTokio, broker } = agency;
    if (status === 'ACTIVE' && isFromTokio) {
      return agency;
    }

    if (status === 'PENDING' && isFromTokio && broker.status) {
      return agency;
    }

    if (status === 'PENDING' && isFromTokio && broker.id === 0) {
      return agency;
    }

    await this.deleteOrMigrateOldAgency(agency);

    return null;
  }

  async deleteOrMigrateOldAgency(agency) {
    if (agency.status === 'WAITING') {
      return this.agencyRepository.deleteAgency(agency.id);
    }

    if (['DISABLED', 'ACTIVE'].includes(agency.status) && !agency.isFromTokio) {
      return this.agencyRepository.updateAgency(agency.id, {
        license: null,
        oldLicense: agency.license,
      });
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
