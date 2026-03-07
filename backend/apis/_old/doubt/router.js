const Controller = require('./controller')
const Service = require('./service')

module.exports = function createDataRouter (Router, errHandler) {
  const router = Router()
  const service = Service()
  const controller = Controller(service,errHandler)

  router.get('/', controller.getDataController)
  router.get('/bydate', controller.getDataByDateController)
  router.get('/minmaxdate', controller.getMinMaxDateController)
  router.get('/minmaxdatebyvessel', controller.getMinMaxDateByVesselController)
  router.get('/histogram', controller.getHistogramController)
  router.get('/trajectory', controller.getTrajectoryController)

  return router
}
