const faker = require('faker');
const AgencyController = require('../controllers/AgencyController');
const InvalidDataError = require('../helpers/errors/InvalidDataError');
const ExistentAgencyError = require('../helpers/errors/ExistentAgencyError');

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
    findAgencyByLicense: jest.fn().mockResolvedValue([{}]),
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

    it('should call service validator with request body', async () => {
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

    describe('If already exists some agency', () => {
      it('should throw if agency is ACTIVE and is from Tokio', async () => {
        const { sut, agencyServiceSpy } = makeSut();
        const { reqMock } = makeReqRes();
        const existentAgency = {
          status: 'ACTIVE',
          isFromTokio: true,
        };

        agencyServiceSpy.findAgencyByLicense.mockResolvedValue([existentAgency]);
        return expect(sut.create(reqMock))
          .rejects
          .toThrow(new ExistentAgencyError(reqMock.body.license));
      });

      it('should throw if agency is PENDING and is from Tokio with a broker.status', async () => {
        const { sut, agencyServiceSpy } = makeSut();
        const { reqMock } = makeReqRes();
        const existentAgency = {
          status: 'PENDING',
          isFromTokio: true,
          broker: {
            status: faker.random.alphaNumeric(),
          },
        };

        agencyServiceSpy.findAgencyByLicense.mockResolvedValue([existentAgency]);
        return expect(sut.create(reqMock))
          .rejects
          .toThrow(new ExistentAgencyError(reqMock.body.license));
      });

      it('should throw if agency is PENDING and broker.id is 0', async () => {
        const { sut, agencyServiceSpy } = makeSut();
        const { reqMock } = makeReqRes();
        const existentAgency = {
          status: 'PENDING',
          broker: {
            id: 0,
          },
        };

        agencyServiceSpy.findAgencyByLicense.mockResolvedValue([existentAgency]);
        return expect(sut.create(reqMock))
          .rejects
          .toThrow(new ExistentAgencyError(reqMock.body.license));
      });
      it('should call repository.deleteAgency when status = WAITING', async () => {
        const { sut, agencyRepositorySpy, agencyServiceSpy } = makeSut();
        const { reqMock } = makeReqRes();
        const existentAgency = {
          status: 'WAITING',
          id: faker.random.alphaNumeric(),
        };
        agencyServiceSpy.findAgencyByLicense.mockResolvedValue([existentAgency]);

        await sut.create(reqMock);
        expect(agencyRepositorySpy.delete).toHaveBeenCalledWith(existentAgency.id);
      });
    });
  });
});
