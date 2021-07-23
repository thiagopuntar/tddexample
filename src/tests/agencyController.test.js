const AgencyController = require('../controllers/AgencyController')
const InvalidDataError = require('../helpers/errors/InvalidDataError')
const faker = require('faker')
const ExistentAgencyError = require('../helpers/errors/ExistentAgencyError')

const makeReqRes = () => {
  const reqMock = {
    body: {
      license: faker.random.alphaNumeric()
    }
  }

  const resMock = {
    send: jest.fn()
  }

  return {
    reqMock, resMock
  }
}

const makeSut = () => {
  const agencyServiceSpy = {
    validate: jest.fn().mockReturnValue(null),
    findAgencyByLicense: jest.fn().mockResolvedValue([{}])
  }

  const sut = new AgencyController(agencyServiceSpy)
  return {
    sut,
    agencyServiceSpy
  }
}

describe('AgencyController', () => {
  describe('create', () => {
    it('should be defined', () => {
      const { sut } = makeSut()
      expect(sut.create).toBeDefined()
    })

    it('should call service validator with request body', async () => {
      const { sut, agencyServiceSpy } = makeSut()
      const { reqMock } = makeReqRes()
      await sut.create(reqMock)
      expect(agencyServiceSpy.validate).toHaveBeenCalledWith(reqMock.body)
    })

    it('should throw when service validator returns an array', () => {
      const { sut, agencyServiceSpy } = makeSut()
      const { reqMock } = makeReqRes()
      const validateMockValue = []
      agencyServiceSpy.validate.mockReturnValue(validateMockValue)
      return expect(sut.create(reqMock)).rejects.toThrow(new InvalidDataError(validateMockValue))
    })

    it('should call service.findAgencyByLicense with body.license', async () => {
      const { sut, agencyServiceSpy } = makeSut()
      const { reqMock } = makeReqRes()

      await sut.create(reqMock)
      expect(agencyServiceSpy.findAgencyByLicense).toHaveBeenCalledWith(reqMock.body.license)
    })

    describe('If already exists some agency', () => {
      it('should throw if agency is ACTIVE and is from Tokio', async () => {
        const { sut, agencyServiceSpy } = makeSut()
        const { reqMock } = makeReqRes()
        const existentAgency = {
          status: 'ACTIVE',
          isFromTokio: true
        }

        agencyServiceSpy.findAgencyByLicense.mockResolvedValue([existentAgency])
  
        return expect(sut.create(reqMock)).rejects.toThrow(new ExistentAgencyError(reqMock.body.license))
      })

    })

  })
})