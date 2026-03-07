const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// 로컬 JSON 파일 임포트 (경로는 실제 위치에 맞게 수정 필요)
const loitering = require('../../example/df_loitering_behavior.json')

const { DB_HOST, DB_USER, DB_PASSWD, DB_DATABASE } = process.env
const client = new Client({ host: DB_HOST, user: DB_USER, password: DB_PASSWD, database: DB_DATABASE })
client.connect()

module.exports = function createServicesService () {
  return {
    // ==========================================
    // [01-LVD] 관심지역 의심선박 분류 (구 doubt)
    // ==========================================
    getLvdDataService: async ({ start, end }) => {
      if (!start || !end) return []

      const query = `
        WITH distincted AS (
          WITH joined AS (
            SELECT shipdetails.*, aisdetails.posutcmin, aisdetails.longitude, aisdetails.latitude, aisdetails.cog, aisdetails.navstatuscode
            FROM shipdetails
            INNER JOIN aisdetails ON shipdetails.mmsi=aisdetails.mmsi 
            WHERE flagcountry='Korea'
            AND posutcmin > ${start}
            AND posutcmin < ${end}
            ORDER BY aisdetails.posutcmin DESC
            LIMIT 100000
          )
          SELECT DISTINCT ON (mmsi) * FROM joined
        )
        SELECT distincted.*, fishingfinal.fnf_bool
        FROM distincted
        INNER JOIN fishingfinal ON distincted.mmsi=fishingfinal.mmsi AND distincted.posutcmin=fishingfinal.posutcmin AND fishingfinal.fnf_bool=true;
      `
      const { rows } = await client.query(query)

      const loiteringVessel = Array.from(
        loitering.reduce((m, v) => {
          const existing = m.get(v.mmsi)
          if (!existing || new Date(v.time) > new Date(existing.time)) m.set(v.mmsi, v)
          return m
        }, new Map()).values()
      )

      loiteringVessel.forEach(v => v.suspected_cls = '3')
      return [...rows, ...loiteringVessel]
    },

    getLvdHistogramService: async ({ start, end, unit }) => {
      const indexEnd = (() => {
        switch (unit) {
          case 'year': return 4
          case 'month': return 6
          case 'day': return 8
          default: return 10
        }
      })()

      // 💡 기존 코드에 ${table} 이 undefined 였던 버그 수정 -> aisdetails 로 명시
      const query = `
        SELECT SUBSTRING(posutcmin::TEXT, 1, ${indexEnd}) AS year_month_day_hour, COUNT(*) AS count
        FROM aisdetails
        WHERE posutcmin > ${start} AND posutcmin < ${end}
        GROUP BY year_month_day_hour
        ORDER BY year_month_day_hour;
      `
      const { rows } = await client.query(query)
      return rows
    },

    // ==========================================
    // [03-FAC] 조업/비조업 자동식별 (구 iuu)
    // ==========================================
    getFacDataService: async ({ start, end }) => {
      if (!start || !end) return []
      const query = `
        SELECT aisdetails.*, fishingfinal.fnf_bool, fishingfinal.fnf_confidence
        FROM aisdetails
        INNER JOIN fishingfinal ON aisdetails.mmsi=fishingfinal.mmsi AND aisdetails.posutcmin=fishingfinal.posutcmin
        WHERE fnf_bool=true
          AND aisdetails.posutcmin > ${start}
          AND aisdetails.posutcmin < ${end}
        LIMIT 30000;
      `
      const { rows } = await client.query(query)
      return rows
    },

    getFacListService: async ({ start, end }) => {
      if (!start || !end) return []
      const query = `
        WITH distincted AS (
          WITH joined AS (
            SELECT aisdetails.*, fishingfinal.fnf_bool, fishingfinal.fnf_confidence
            FROM aisdetails
            INNER JOIN fishingfinal ON aisdetails.mmsi=fishingfinal.mmsi AND aisdetails.posutcmin=fishingfinal.posutcmin
            WHERE fnf_bool=true
            AND aisdetails.posutcmin > ${start}
            AND aisdetails.posutcmin < ${end}
          )
          SELECT DISTINCT ON (mmsi) * FROM joined
        )
        SELECT distincted.*, shipdetails.callsign, shipdetails.shiptype, shipdetails.flagcountry
        FROM distincted
        INNER JOIN shipdetails ON distincted.mmsi=shipdetails.mmsi;
      `
      const { rows } = await client.query(query)
      rows.forEach((r, i) => { r.idx = i })
      return rows
    },

    getFacTrajectoryService: async ({ mmsi, start, end }) => {
      if (!mmsi || !start || !end) return []
      const query = `
        SELECT aisdetails.mmsi, longitude, latitude, aisdetails.posutcmin, fishingfinal.fnf_bool
        FROM aisdetails
        INNER JOIN fishingfinal ON aisdetails.mmsi=fishingfinal.mmsi AND aisdetails.posutcmin=fishingfinal.posutcmin
        WHERE aisdetails.mmsi=${mmsi}
          AND aisdetails.posutcmin > ${start}
          AND aisdetails.posutcmin < ${end}
        ORDER BY aisdetails.posutcmin DESC;
      `
      const { rows } = await client.query(query)
      return rows
    },

    // ==========================================
    // [06-SVT] 의심선박 시공간 추적 (구 tracing)
    // ==========================================
    getSvtListService: () => {
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
