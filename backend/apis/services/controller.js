const fs = require('fs')
const path = require('path')

module.exports = function createServicesController (service, errHandler) {
  return {
    // --- 01-LVD ---
    getLvdDataController: async (req, res, next) => {
      try { res.send(await service.getLvdDataService(req.query)) } catch (e) { next(errHandler(500, e)) }
    },
    getLvdHistogramController: async (req, res, next) => {
      try { res.send(await service.getLvdHistogramService(req.query)) } catch (e) { next(errHandler(500, e)) }
    },

    // --- 02-TVD ---
    getTvdDataController: async (req, res, next) => {
      try { res.send(await service.getTvdDataService(req.query)) } catch (e) { next(errHandler(500, e)) }
    },

    // --- 03-FAC ---
    getFacDataController: async (req, res, next) => {
      try { res.send(await service.getFacDataService(req.query)) } catch (e) { next(errHandler(500, e)) }
    },
    getFacListController: async (req, res, next) => {
      try { res.send(await service.getFacListService(req.query)) } catch (e) { next(errHandler(500, e)) }
    },
    getFacTrajectoryController: async (req, res, next) => {
      try { res.send(await service.getFacTrajectoryService(req.query)) } catch (e) { next(errHandler(500, e)) }
    },

    // --- 05-FPI ---
    getFpiDataController: async (req, res, next) => {
      try { res.send(await service.getFpiDataService(req.query)) } catch (e) { next(errHandler(500, e)) }
    },

    // --- 06-SVT ---
    getSvtListController: async (req, res, next) => {
      try { res.send(service.getSvtListService()) } catch (e) { next(errHandler(500, e)) }
    },
    // 파일 서빙은 Controller에서 직접 응답 처리 (구 tracing.getImgController)
    getSvtImgController: (req, res, next) => {
      const { dir, file } = req.params
      const imagePath = path.join(__dirname, '..', '..', 'multi_trajectory', dir, file)

      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) return next(errHandler(404, 'Image not found'))
        res.sendFile(imagePath)
      })
    },
    // 시공간 궤적 예측 컨트롤러 추가
    reqSvtPredictController: async (req, res, next) => {
      try { res.send(await service.reqSvtPredictService(req.body)) } 
      catch (e) { next(errHandler(500, e)) }
    },

    // --- 08-LAVT ---
    getLavtDataController: async (req, res, next) => {
      try { res.send(await service.getLavtDataService(req.query)) } catch (e) { next(errHandler(500, e)) }
    }
  }
}
