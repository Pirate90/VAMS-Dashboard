const Controller = require('./controller')
const Service = require('./service')

module.exports = function createDataRouter (Router, errHandler) {
  const router = Router()
  const service = Service()
  const controller = Controller(service,errHandler)

  router.get('/', controller.getDataController)
  router.get('/list', controller.getListController)
  router.get('/minmaxdate', controller.getMinMaxDateController)
  router.get('/trajectory', controller.getTrajectoryController)

  return router
}
