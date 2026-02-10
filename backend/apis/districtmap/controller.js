module.exports = function createDistrictmapController (service, errHandler) {
  return {
    getListController: async (req, res, next) => {
      try {
        const result = await service.getListService()
        res.send(result)
      } catch (error) {
        next(errHandler(500, error))
      }
    }
  }
}
