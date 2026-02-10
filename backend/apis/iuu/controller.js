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

    getListController: async (req, res, next) => {
      try {
        const result = await service.getListService(req.query)
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
