const { Client } = require('pg')
const loitering = require('../../example/df_loitering_behavior.json')
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
          SELECT DISTINCT ON (mmsi) *
          FROM joined
        )
        SELECT distincted.*, fishingfinal.fnf_bool
        FROM distincted
        INNER JOIN fishingfinal ON distincted.mmsi=fishingfinal.mmsi AND distincted.posutcmin=fishingfinal.posutcmin AND fishingfinal.fnf_bool=true;
      `

      const { rows } = await client.query(query)

      const loiteringVessel = Array.from(
        loitering.reduce((m, v) => {
          const existing = m.get(v.mmsi)
          if (!existing || new Date(v.time) > new Date(existing.time)) {
            m.set(v.mmsi, v)
          }
          return m
        }, new Map()).values()
      )

      loiteringVessel.forEach(v => v.suspected_cls = '3')

      return [...rows, ...loiteringVessel]
    },

    getDataByDateService: async ({ start, end }) => {
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


// WHERE s.flagcountry = 'Korea'
// LIMIT 10000;
//         WITH joined AS (
//           SELECT shipdetails.*, aisdetails.posutcmin, aisdetails.longitude, aisdetails.latitude, aisdetails.cog
//           FROM aisdetails
//           INNER JOIN shipdetails ON shipdetails.mmsi=aisdetails.mmsi 
//           WHERE flagcountry='Korea'
//             AND posutcmin > ${start}
//             AND posutcmin < ${end}
//           ORDER BY aisdetails.posutcmin DESC
//           LIMIT 100000
//         )
//         SELECT DISTINCT ON (mmsi) *
//         FROM joined;

      const { rows } = await client.query(query)
      return rows
    },

    getMinMaxDateService: async () => {
      const query = `
        SELECT
          to_timestamp(MIN(posutcmin)::TEXT, 'yyyymmddhh24miss') as min,
          to_timestamp(MAX(posutcmin)::TEXT, 'yyyymmddhh24miss') as max
        FROM aisdetails;
      `
      const { rows } = await client.query(query)
      return rows[0]
    },

    getMinMaxDateByVesselService: async (mmsi) => {
      const query = `
        SELECT
          to_timestamp(MIN(posutcmin)::TEXT, 'yyyymmddhh24miss') as min,
          to_timestamp(MAX(posutcmin)::TEXT, 'yyyymmddhh24miss') as max
        FROM aisdetails
        WHERE mmsi=${mmsi};
      `
      const { rows } = await client.query(query)
      return rows[0]
    },

    getHistogramService: async ({ start, end, unit }) => {
      const indexEnd = (() => {
        switch (unit) {
          case 'year':
            return 4
          case 'month':
            return 6
          case 'day':
            return 8
          default:
            return 10
        }
      })()

      const query = `
        SELECT SUBSTRING(posutcmin::TEXT, 1, ${indexEnd}) AS year_month_day_hour, COUNT(*) AS count
        FROM ${table}
        WHERE posutcmin > ${start}
        AND posutcmin < ${end}
        GROUP BY year_month_day_hour
        ORDER BY year_month_day_hour;
      `
      const { rows } = await client.query(query)
      return rows
    },

    getTrajectoryService: async ({ mmsi, start, end }) => {
      const query = `
        SELECT mmsi, longitude, latitude, posutcmin FROM aisdetails
        WHERE mmsi=${mmsi}
          AND posutcmin > ${start}
          AND posutcmin < ${end}
        ORDER BY aisdetails.posutcmin DESC;
      `

      const { rows } = await client.query(query)
      return rows
    }
  }
}
