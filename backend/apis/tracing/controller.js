const fs = require('fs')
const path = require('path')

module.exports = function createTracingController (service, errHandler) {
  return {
    getListController: async (req, res, next) => {
      try {
        const result = service.getListService()
        res.send(result)
      } catch (error) {
        next(errHandler(500, error))
      }
    },

    getImgController: (req, res, next) => {
      const { dir, file } = req.params
      const imagePath = path.join(__dirname,'..', '..', 'multi_trajectory', dir, file)

      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
          return next(createError(404, 'Image not found'))
        }

        res.sendFile(imagePath)
      })
    }
  }
}
