module.exports = function createDataController (service, errHandler) {
  return {
    getDataController: async (req, res, next) => {
      try {
        const result = await service.getDataService(req.query)
        res.send(result)
      } catch (error) {
        next(errHandler(500, error))
      }
    },

    getDataByDateController: async (req, res, next) => {
      try {
        const result = await service.getDataByDateService(req.query)
        res.send(result)
      } catch (error) {
        next(errHandler(500, error))
      }
    },

    getMinMaxDateController: async (req, res, next) => {
      try {
        const result = await service.getMinMaxDateService()
        res.send(result)
      } catch (error) {
        next(errHandler(500, error))
      }
    },

    getMinMaxDateByVesselController: async (req, res, next) => {
      try {
        const result = await service.getMinMaxDateService(req.query.mmsi)
        res.send(result)
      } catch (error) {
        next(errHandler(500, error))
      }
    },

    getHistogramController: async (req, res, next) => {
      try {
        const result = await service.getHistogramService(req.query)
        res.send(result)
      } catch (error) {
        next(errHandler(500, error))
      }
    },

    getTrajectoryController: async (req, res, next) => {
      try {
        const result = await service.getTrajectoryService(req.query)
        res.send(result)
      } catch (error) {
        next(errHandler(500, error))
      }
    }
  }
}
