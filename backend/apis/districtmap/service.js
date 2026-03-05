const fs = require('fs')
const path = require('path')

const { ROOT_PATH } = process.env

module.exports = function createDistrictmapService () {
  return {
    getListService: () => {
      const list = fs.readdirSync(path.join(ROOT_PATH, 'districtmap'), { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.geojson')) // ✅ 괄호 추가 및 geojson 확장자 필터링
        .map(f => f.name.split('.')[0])
      return list
    }
  }
}
