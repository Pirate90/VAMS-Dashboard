const Controller = require('./controller')
const Service = require('./service')

module.exports = function createServicesRouter (Router, errHandler) {
  const router = Router()
  const service = Service()
  const controller = Controller(service, errHandler)

  // [01-LVD] 의심선박 분류 (구 doubt)
  router.get('/01-lvd/data', controller.getLvdDataController)
  router.get('/01-lvd/histogram', controller.getLvdHistogramController)

  // [02-TVD] 환적 의심선박 분류
  router.get('/02-tvd/data', controller.getTvdDataController)

  // [03-FAC] 조업/비조업 자동식별 (구 iuu)
  router.get('/03-fac/data', controller.getFacDataController)
  router.get('/03-fac/list', controller.getFacListController)
  router.get('/03-fac/trajectory', controller.getFacTrajectoryController)

  // [05-FPI] IUU 어업패턴 감시 (불법어업)
  router.get('/05-fpi/data', controller.getFpiDataController)

  // [06-SVT] 의심선박 시공간 추적 (구 tracing)
  router.get('/06-svt/list', controller.getSvtListController)
  router.get('/06-svt/img/:dir/:file', controller.getSvtImgController) // 이미지 파일 서빙 라우트
  // 시공간 궤적 예측 요청 라우트
  router.post('/06-svt/predict', controller.reqSvtPredictController)

  // [08-LAVT] 입항지연 선박 추적
  router.get('/08-lavt/data', controller.getLavtDataController)

  return router
}
