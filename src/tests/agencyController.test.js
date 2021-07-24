const faker = require('faker');
const AgencyController = require('../controllers/AgencyController');
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
    findAgencyByLicense: jest.fn().mockResolvedValue([
      {
        status: faker.random.alphaNumeric(),
        isFromTokio: faker.datatype.boolean(),
      },
    ]),
    checkIfCanCreate: jest.fn(),
    migrateAgency: jest.fn(),
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
      const [existentAgency] = await agencyServiceSpy.findAgencyByLicense();

      await sut.create(reqMock);
      expect(agencyServiceSpy.checkIfCanCreate).toHaveBeenCalledWith(existentAgency);
    });
  });
});
