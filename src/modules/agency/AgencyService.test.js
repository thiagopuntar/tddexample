const AgencyService = require('./AgencyService');

describe('AgencyService', () => {
  const makeSut = () => {
    const sut = new AgencyService();

    return {
      sut,
    };
  };

  describe('smoke tests', () => {
    it('should have method validate defined', () => {
      const { sut } = makeSut();
      expect(sut.validate).toBeDefined();
    });
    it('should have method findAgencyByLicense defined', () => {
      const { sut } = makeSut();
      expect(sut.findAgencyByLicense).toBeDefined();
    });
    it('should have method createAgencyAtBroker defined', () => {
      const { sut } = makeSut();
      expect(sut.createAgencyAtBroker).toBeDefined();
    });
    it('should have method saveAgency defined', () => {
      const { sut } = makeSut();
      expect(sut.saveAgency).toBeDefined();
    });
  });
});
