const faker = require('faker');
const axios = require('axios');
const AgencyService = require('./AgencyService');

jest.mock('axios');

describe('AgencyService', () => {
  const makeSut = () => {
    const agencyRepositorySpy = {
      findByLicense: jest.fn().mockResolvedValue(null),
      deleteAgency: jest.fn(),
      updateAgency: jest.fn(),
    };
    const sut = new AgencyService(agencyRepositorySpy);

    return {
      sut,
      agencyRepositorySpy,
    };
  };

  describe('smoke tests', () => {
    it('should have method validate defined', () => {
      const { sut } = makeSut();
      expect(sut.validate).toBeDefined();
    });
    it('should have method findAgencyByLicense defined', () => {
      const { sut } = makeSut();
      expect(sut.findValidAgencyByLicense).toBeDefined();
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
  describe('validate', () => {
    it('should return null when all fields are valid', () => {
      const { sut } = makeSut();

      const body = {
        license: faker.random.word(),
        name: faker.random.word(),
      };
      const result = sut.validate(body);
      expect(result).toBe(null);
    });
    it('should return required when license is falsy', () => {
      const { sut } = makeSut();

      const body = {};
      const result = sut.validate(body);
      expect(result).toMatch('required');
    });

    it('should return required when name is falsy', () => {
      const { sut } = makeSut();

      const body = {
        license: faker.random.word(),
        name: '',
      };
      const result = sut.validate(body);
      expect(result).toMatch('required');
    });
  });
  describe('findValidAgencyByLicense', () => {
    it('should call repository.findByLicence', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const license = faker.random.word();
      await sut.findValidAgencyByLicense(license);
      expect(agencyRepositorySpy.findByLicense).toHaveBeenCalledWith(license);
    });
    it('should return null when no agency is found', async () => {
      const { sut } = makeSut();
      const result = await sut.findValidAgencyByLicense();
      expect(result).toBe(null);
    });
    it('should return found agency when status ACTIVE & isFromTokio', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const agency = {
        status: 'ACTIVE',
        isFromTokio: true,
      };
      agencyRepositorySpy.findByLicense.mockResolvedValue(agency);
      const result = await sut.findValidAgencyByLicense();
      expect(result).toBe(agency);
    });
    it('should return found agency when status PENDING, isFromTokio & broker.status is truthy', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const agency = {
        status: 'PENDING',
        isFromTokio: true,
        broker: {
          status: faker.random.word(),
        },
      };
      agencyRepositorySpy.findByLicense.mockResolvedValue(agency);
      const result = await sut.findValidAgencyByLicense();
      expect(result).toBe(agency);
    });
    it('should return found agency when status PENDING, isFromTokio & broker.id 0', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const agency = {
        status: 'PENDING',
        isFromTokio: true,
        broker: {
          id: 0,
        },
      };
      agencyRepositorySpy.findByLicense.mockResolvedValue(agency);
      const result = await sut.findValidAgencyByLicense();
      expect(result).toBe(agency);
    });
    it('should call deleteOrMigrateOldAgency when invalid agency', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const agency = {
        status: faker.random.word(),
        id: faker.random.alphaNumeric(),
      };
      agencyRepositorySpy.findByLicense.mockResolvedValue(agency);
      sut.deleteOrMigrateOldAgency = jest.fn();

      await sut.findValidAgencyByLicense();
      expect(sut.deleteOrMigrateOldAgency).toHaveBeenCalledWith(agency);
    });
    it('should return null when agency is found but is invalid', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      agencyRepositorySpy.findByLicense.mockResolvedValue({});
      const result = await sut.findValidAgencyByLicense();
      expect(result).toBe(null);
    });
  });
  describe('deleteOrMigrateOldAgency', () => {
    it('should call repository.deleteAgency only when status = WAITING', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const agency = {
        status: 'WAITING',
        id: faker.random.alphaNumeric(),
      };
      await sut.deleteOrMigrateOldAgency(agency);
      expect(agencyRepositorySpy.deleteAgency).toHaveBeenCalledWith(agency.id);
    });
    it('should call repository.updateAgency when status = ACTIVE and isFromTokio = false', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const agency = {
        status: 'ACTIVE',
        license: faker.random.word(),
        id: faker.random.alphaNumeric(),
      };
      const dataToUpdate = {
        license: null,
        oldLicense: agency.license,
      };
      await sut.deleteOrMigrateOldAgency(agency);
      expect(agencyRepositorySpy.updateAgency).toHaveBeenCalledWith(agency.id, dataToUpdate);
    });
    it('should call repository.updateAgency when status = DISABLED and isFromTokio = false', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const agency = {
        status: 'DISABLED',
        license: faker.random.word(),
        id: faker.random.alphaNumeric(),
      };
      const dataToUpdate = {
        license: null,
        oldLicense: agency.license,
      };
      await sut.deleteOrMigrateOldAgency(agency);
      expect(agencyRepositorySpy.updateAgency).toHaveBeenCalledWith(agency.id, dataToUpdate);
    });
    it('should NOT call repository.methods isFromTokio = true', async () => {
      const { sut, agencyRepositorySpy } = makeSut();
      const agency = {
        isFromTokio: true,
        status: faker.random.word(),
        license: faker.random.word(),
        id: faker.random.alphaNumeric(),
      };
      await sut.deleteOrMigrateOldAgency(agency);
      expect(agencyRepositorySpy.updateAgency).not.toHaveBeenCalled();
      expect(agencyRepositorySpy.deleteAgency).not.toHaveBeenCalled();
    });
  });
  describe('createAgencyAtBroker', () => {
    let axiosResponse;
    beforeEach(() => {
      axiosResponse = {
        data: {
          status: faker.random.word(),
        },
      };
      axios.post.mockResolvedValue(axiosResponse);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should POST to tokio endpoint', async () => {
      const { sut } = makeSut();
      await sut.createAgencyAtBroker();
      expect(axios.post).toHaveBeenCalled();
    });
    it('should throw when POST fail', async () => {
      const { sut } = makeSut();
      axios.post.mockRejectedValue(new Error());
      return expect(sut.createAgencyAtBroker()).rejects.toThrow();
    });

    it('should return tokio response data', async () => {
      const { sut } = makeSut();

      const result = await sut.createAgencyAtBroker();
      expect(result).toBe(axiosResponse.data);
    });
  });
});
