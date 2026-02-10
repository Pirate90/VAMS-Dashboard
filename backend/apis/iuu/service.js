const { Client } = require('pg')
const {
  DB_HOST: host,
  DB_USER: user,
  DB_PASSWD: password,
  DB_DATABASE: database,
} = process.env

const client = new Client({ host, user, password, database })
client.connect()

module.exports = function createDataService () {
  return {
    getDataService: async ({ start, end }) => {
      const query = `
        SELECT aisdetails.*, fishingfinal.fnf_bool, fishingfinal.fnf_confidence
        FROM aisdetails
        INNER JOIN fishingfinal ON aisdetails.mmsi=fishingfinal.mmsi AND aisdetails.posutcmin=fishingfinal.posutcmin
        WHERE fnf_bool=true
          AND aisdetails.posutcmin > ${start}
          AND aisdetails.posutcmin < ${end};
      `

      const { rows } = await client.query(query)
      return rows
    },

    getListService: async ({ start, end }) => {
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
          SELECT DISTINCT ON (mmsi) *
          FROM joined
        )
        SELECT distincted.*, shipdetails.callsign,
          shipdetails.shiptype, shipdetails.flagcountry
        FROM distincted
        INNER JOIN shipdetails ON distincted.mmsi=shipdetails.mmsi;
      `

      const { rows } = await client.query(query)
      rows.forEach((r, i) => {
        r.idx = i
      })
      return rows
    },

    getMinMaxDateService: async () => {
      const query = `
        SELECT
          to_timestamp(MIN(posutcmin)::TEXT, 'yyyymmddhh24miss') as min,
          to_timestamp(MAX(posutcmin)::TEXT, 'yyyymmddhh24miss') as max
        FROM fishingfinal;
      `
      const { rows } = await client.query(query)
      return rows[0]
    },

    getTrajectoryService: async ({ mmsi, start, end }) => {
      const query = `
        SELECT aisdetails.mmsi, longitude, latitude, aisdetails.posutcmin, fishingfinal.fnf_bool
        FROM aisdetails
        INNER JOIN fishingfinal ON aisdetails.mmsi=fishingfinal.mmsi
          AND aisdetails.posutcmin=fishingfinal.posutcmin
        WHERE aisdetails.mmsi=${mmsi}
          AND aisdetails.posutcmin > ${start}
          AND aisdetails.posutcmin < ${end}
        ORDER BY aisdetails.posutcmin DESC;
      `

      const { rows } = await client.query(query)
      return rows
    }
  }
}
