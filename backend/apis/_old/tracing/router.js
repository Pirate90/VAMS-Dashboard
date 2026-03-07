const Controller = require('./controller')
const Service = require('./service')

module.exports = function createTracingRouter (Router, errHandler) {
  const router = Router()
  const service = Service()
  const controller = Controller(service,errHandler)

  router.get('/img/:dir/:file', controller.getImgController)
  router.get('/list', controller.getListController)

  return router
}
