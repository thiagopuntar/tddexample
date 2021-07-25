const faker = require('faker');
const AgencyController = require('./AgencyController');
const BrokerError = require('../../helpers/errors/BrokerError');
const ExistentAgencyError = require('../../helpers/errors/ExistentAgencyError');
const InvalidDataError = require('../../helpers/errors/InvalidDataError');

const makeReqRes = () => {
  const reqMock = {
    body: {
      license: faker.random.alphaNumeric(),
    },
  };

  const resMock = {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  };

  return {
    reqMock, resMock,
  };
};

const makeSut = () => {
  const agencyServiceSpy = {
    validate: jest.fn().mockReturnValue(null),
    findValidAgencyByLicense: jest.fn().mockResolvedValue(undefined),
    createAgencyAtBroker: jest.fn().mockResolvedValue({}),
    saveAgency: jest.fn(),
  };

  const sut = new AgencyController(agencyServiceSpy);
  return {
    sut,
    agencyServiceSpy,
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
      const { reqMock, resMock } = makeReqRes();
      await sut.create(reqMock, resMock);
      expect(agencyServiceSpy.validate).toHaveBeenCalledWith(reqMock.body);
    });

    it('should throw when service.validator returns an array', () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      const validateMockValue = [];
      agencyServiceSpy.validate.mockReturnValue(validateMockValue);
      return expect(sut.create(reqMock)).rejects.toThrow(new InvalidDataError(validateMockValue));
    });

    it('should throw if service.findAgencyByLicense return some agency', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      const status = faker.random.word();
      agencyServiceSpy.findValidAgencyByLicense.mockResolvedValue({
        status,
      });

      return expect(sut.create(reqMock))
        .rejects
        .toThrow(new ExistentAgencyError(reqMock.body.license, status));
    });
    it('should call service.findAgencyByLicense with body.license', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock, resMock } = makeReqRes();

      await sut.create(reqMock, resMock);
      expect(agencyServiceSpy.findValidAgencyByLicense).toHaveBeenCalledWith(reqMock.body.license);
    });

    it('should call service.createAgencyAtBroker', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock, resMock } = makeReqRes();

      await sut.create(reqMock, resMock);
      expect(agencyServiceSpy.createAgencyAtBroker).toHaveBeenCalledWith(reqMock.body);
    });

    it('should throw when service.createAgencyAtBroker throws', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock } = makeReqRes();
      const errorMessage = faker.random.words;
      agencyServiceSpy.createAgencyAtBroker.mockRejectedValue(new Error(errorMessage));

      return expect(sut.create(reqMock)).rejects.toThrow(new BrokerError(errorMessage));
    });

    it('should call service.saveAgency', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock, resMock } = makeReqRes();
      const brokerResponse = await agencyServiceSpy.createAgencyAtBroker();

      await sut.create(reqMock, resMock);
      expect(agencyServiceSpy.saveAgency).toHaveBeenCalledWith(reqMock.body, brokerResponse);
    });

    it('should call res.send with broker result and 201 status', async () => {
      const { sut, agencyServiceSpy } = makeSut();
      const { reqMock, resMock } = makeReqRes();
      const brokerResponse = await agencyServiceSpy.createAgencyAtBroker();

      await sut.create(reqMock, resMock);
      expect(resMock.send).toHaveBeenCalledWith(brokerResponse);
      expect(resMock.status).toHaveBeenCalledWith(201);
    });
  });
});
