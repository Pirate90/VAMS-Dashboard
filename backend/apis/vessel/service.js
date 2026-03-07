const { Client } = require('pg')
const { DB_HOST, DB_USER, DB_PASSWD, DB_DATABASE } = process.env

const client = new Client({ host: DB_HOST, user: DB_USER, password: DB_PASSWD, database: DB_DATABASE })
client.connect()

module.exports = function createVesselService () {
  return {
    // 구 doubt.getDataByDateService 로직을 범용 선박 조회로 사용
    getDataService: async ({ start, end }) => {
      if (!start || !end) return []
      
      const query = `
        SELECT DISTINCT ON (a.mmsi) 
            s.*, a.posutcmin, a.longitude, a.latitude, a.cog
        FROM (
            SELECT * FROM aisdetails
            WHERE posutcmin > ${start} AND posutcmin < ${end}
            ORDER BY mmsi, posutcmin DESC
        ) a
        INNER JOIN shipdetails s ON s.mmsi = a.mmsi
      `
      const { rows } = await client.query(query)
      return rows
    },

    // 구 doubt.getMinMaxDate 와 getMinMaxDateByVessel 통합
    getMinMaxDateService: async ({ mmsi }) => {
      const condition = mmsi ? `WHERE mmsi=${mmsi}` : ''
      const query = `
        SELECT
          to_timestamp(MIN(posutcmin)::TEXT, 'yyyymmddhh24miss') as min,
          to_timestamp(MAX(posutcmin)::TEXT, 'yyyymmddhh24miss') as max
        FROM aisdetails ${condition};
      `
      const { rows } = await client.query(query)
      return rows[0]
    },

    // 구 doubt.getTrajectoryService (범용 궤적)
    getTrajectoryService: async ({ mmsi, start, end }) => {
      if (!mmsi || !start || !end) return []
      const query = `
        SELECT mmsi, longitude, latitude, posutcmin FROM aisdetails
        WHERE mmsi=${mmsi}
          AND posutcmin > ${start}
          AND posutcmin < ${end}
        ORDER BY posutcmin DESC;
      `
      const { rows } = await client.query(query)
      return rows
    }
  }
}
