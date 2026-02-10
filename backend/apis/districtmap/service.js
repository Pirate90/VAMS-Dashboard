const fs = require('fs')
const path = require('path')

const { ROOT_PATH } = process.env

module.exports = function createDistrictmapService () {
  return {
    getListService: () => {
      const list = fs.readdirSync(path.join(ROOT_PATH, 'districtmap'), { withFileTypes: true })
        .filter(f => f.isFile)
        .map(f => f.name.split('.')[0])

      return list
    }
  }
}
