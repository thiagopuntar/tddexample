const AgencyController = require('../controllers/AgencyController')
const InvalidDataError = require('../helpers/errors/InvalidDataError')

const makeReqRes = () => {
  const reqMock = {
    body: {}
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
    validate: jest.fn().mockReturnValue(null)
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
      agencyServiceSpy.validate = jest.fn().mockReturnValue(validateMockValue)
      return expect(sut.create(reqMock)).rejects.toThrow(new InvalidDataError(validateMockValue))
    })
  })
})