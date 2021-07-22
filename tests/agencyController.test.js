const AgencyController = require('../controllers/AgencyController')

const makeSut = () => {
  const sut = new AgencyController()
  return {
    sut
  }
}

describe('AgencyController', () => {
  describe('create', () => {
    it('should be defined', () => {
      const { sut } = makeSut()
      expect(sut.create).toBeDefined()
    })

    
  })
})