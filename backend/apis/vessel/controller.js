module.exports = function createVesselController (service, errHandler) {
  return {
    getDataController: async (req, res, next) => {
      try { res.send(await service.getDataService(req.query)) }
      catch (error) { next(errHandler(500, error)) }
    },
    getMinMaxDateController: async (req, res, next) => {
      try { res.send(await service.getMinMaxDateService(req.query)) }
      catch (error) { next(errHandler(500, error)) }
    },
    getTrajectoryController: async (req, res, next) => {
      try { res.send(await service.getTrajectoryService(req.query)) }
      catch (error) { next(errHandler(500, error)) }
    }
  }
}
