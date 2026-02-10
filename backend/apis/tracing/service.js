const fs = require('fs')
const path = require('path')

module.exports = function createTracingService () {
  return {
    getListService: () => {
      const list = fs.readdirSync('./multi_trajectory', { withFileTypes: true })
        .filter(a => a.isDirectory())
        .map(d => d.name)

      return list.map(d => {
        const metadata = fs.readFileSync(path.join('./multi_trajectory', d, 'metadata.geojson'), 'utf-8')
        return { name: d, metadata: JSON.parse(metadata) }
      })
    }
  }
}
