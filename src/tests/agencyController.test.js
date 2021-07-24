const faker = require('faker');
const AgencyController = require('../controllers/AgencyController');
const ExistentAgencyError = require('../helpers/errors/ExistentAgencyError');
const InvalidDataError = require('../helpers/errors/InvalidDataError');

const makeReqRes = () => {
  const reqMock = {
    body: {
      license: faker.random.alphaNumeric(),
    },
  };

  const resMock = {
    send: jest.fn(),
  };

  return {
    reqMock, resMock,
  };
};

const makeSut = () => {
  const agencyServiceSpy = {
    validate: jest.fn().mockReturnValue(null),
    findAgencyByLicense: jest.fn().mockResolvedValue([]),
    checkIfCanCreate: jest.fn().mockResolvedValue(null),
    deleteOrMigrate: jest.fn(),
  };

  const agencyRepositorySpy = {
    delete: jest.fn(),
  };

  const sut = new AgencyController(agencyServiceSpy, agencyRepositorySpy);
  return {
    sut,
    agencyServiceSpy,
    agencyRepositorySpy,
  };
};

describe('AgencyController', () => {
  describe('create', () => {
    it('should be defined', () => {
      const { sut } = makeSut();
      expect(sut.create).toBeDefined();
    });

    it('should call service.validator with request body', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      await sut.create(reqMock);
      expect(agencyServiceSpy.validate).toHaveBeenCalledWith(reqMock.body);
    });

    it('should throw when service.validator returns an array', () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      const validateMockValue = [];
      agencyServiceSpy.validate.mockReturnValue(validateMockValue);
      return expect(sut.create(reqMock)).rejects.toThrow(new InvalidDataError(validateMockValue));
    });

    it('should call service.findAgencyByLicense with body.license', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();

      await sut.create(reqMock);
      expect(agencyServiceSpy.findAgencyByLicense).toHaveBeenCalledWith(reqMock.body.license);
    });

    it('should call service.checkIfCanCreate when some agency already exists', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      const existentAgency = {
        status: faker.random.alphaNumeric(),
        isFromTokio: faker.datatype.boolean(),
      };
      agencyServiceSpy.findAgencyByLicense.mockResolvedValue([existentAgency]);

      await sut.create(reqMock);
      expect(agencyServiceSpy.checkIfCanCreate).toHaveBeenCalledWith(existentAgency);
    });

    it('should NOT call service.checkIfCanCreate when any agency exists', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      agencyServiceSpy.findAgencyByLicense.mockResolvedValue([]);

      await sut.create(reqMock);
      expect(agencyServiceSpy.checkIfCanCreate).not.toHaveBeenCalled();
    });

    it('should throw when service.checkIfCanCreate returns not null', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      const reasonItCantCreate = faker.random.words();
      agencyServiceSpy.checkIfCanCreate.mockResolvedValue(reasonItCantCreate);
      const existentAgency = {
        status: faker.random.alphaNumeric(),
        isFromTokio: faker.datatype.boolean(),
      };
      agencyServiceSpy.findAgencyByLicense.mockResolvedValue([existentAgency]);

      return expect(sut.create(reqMock))
        .rejects
        .toThrow(new ExistentAgencyError(reqMock.body.license, reasonItCantCreate));
    });

    it('should call service.deleteOrMigrate when some agency already exists and can create another', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      const existentAgency = {
        status: faker.random.alphaNumeric(),
        isFromTokio: faker.datatype.boolean(),
      };
      agencyServiceSpy.findAgencyByLicense.mockResolvedValue([existentAgency]);

      await sut.create(reqMock);
      expect(agencyServiceSpy.deleteOrMigrate).toHaveBeenCalledWith(existentAgency);
    });

    it('should NOT call service.deleteOrMigrate when any agency exists', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      agencyServiceSpy.findAgencyByLicense.mockResolvedValue([]);

      await sut.create(reqMock);
      expect(agencyServiceSpy.deleteOrMigrate).not.toHaveBeenCalled();
    });
  });
});
