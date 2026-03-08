const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

// 로컬 JSON 파일 임포트 (경로는 실제 위치에 맞게 수정 필요)
const loitering = require('../../example/df_loitering_behavior.json')

const { DB_HOST, DB_USER, DB_PASSWD, DB_DATABASE } = process.env
const client = new Client({ host: DB_HOST, user: DB_USER, password: DB_PASSWD, database: DB_DATABASE })
client.connect()

module.exports = function createServicesService () {
  return {
    // ==========================================
    // [01-LVD] 관심지역 의심선박 분류
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
    // [03-FAC] 조업/비조업 자동식별
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
    // [06-SVT] 의심선박 시공간 추적
    // ==========================================
    getSvtListService: () => {
      const list = fs.readdirSync('./multi_trajectory', { withFileTypes: true })
        .filter(a => a.isDirectory())
        .map(d => d.name)

      return list.map(d => {
        const metadata = fs.readFileSync(path.join('./multi_trajectory', d, 'metadata.geojson'), 'utf-8')
        return { name: d, metadata: JSON.parse(metadata) }
      })
    },
    // AI 예측 서버로 요청 전송 (Proxy)
    reqSvtPredictService: async (payload) => {
      // URL 끝에 /predict 가 반드시 있어야 합니다!
      const AI_SERVER_URL = 'http://143.248.150.68:5000/predict'
      try {
        console.log('🤖 AI 궤적 예측 요청:', payload)
        // validateStatus를 추가하여 404, 400 등의 에러 코드도 catch로 빠지지 않게 막습니다.
        const response = await axios.post(AI_SERVER_URL, payload, {
          validateStatus: function (status) {
            return status >= 200 && status < 500; // 500 미만의 상태 코드는 에러로 던지지 않음
          }
        })
        // AI 서버가 404(데이터 없음)를 반환했을 경우의 부드러운 처리
        if (response.status === 404) {
          console.warn(`🚨 AI 서버 404 응답: 해당 선박(${payload.mmsi})의 과거 데이터가 없습니다.`)
          return {
            status: "fail",
            message: "AI 서버에 해당 선박의 궤적 데이터가 존재하지 않습니다."
          }
        }
        // 정상(200)일 경우 AI 서버의 결과값 그대로 반환
        return response.data
      } catch (error) {
        // AI 서버가 아예 꺼져있거나 타임아웃 등 진짜 네트워크 통신 실패일 경우
        console.error("🚨 AI 서버 연결 실패:", error.message)
        throw error
      }
    }
  }
}
