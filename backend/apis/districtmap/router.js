const path = require('path')
const Controller = require('./controller')
const Service = require('./service')

const { ROOT_PATH } = process.env

module.exports = function createDistrictmapRouter (static, Router, errHandler) {
  const router = Router()
  const service = Service()
  const controller = Controller(service,errHandler)

  router.use(static(path.join(ROOT_PATH, 'districtmap')))
  router.get('/list', controller.getListController)

  return router
}
