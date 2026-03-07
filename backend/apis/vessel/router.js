const Controller = require('./controller')
const Service = require('./service')

module.exports = function createVesselRouter (Router, errHandler) {
  const router = Router()
  const service = Service()
  const controller = Controller(service, errHandler)

  // 기본 선박 조회
  router.get('/data', controller.getDataController)
  router.get('/minmaxdate', controller.getMinMaxDateController)
  router.get('/trajectory', controller.getTrajectoryController)

  return router
}
