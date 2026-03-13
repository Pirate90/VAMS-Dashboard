const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

// 로컬 JSON 파일 임포트 (경로는 실제 위치에 맞게 수정 필요)
const loitering = require('../../example/df_loitering_behavior.json')

const { DB_HOST, DB_USER, DB_PASSWD, DB_DATABASE } = process.env
const client = new Client({ host: DB_HOST, user: DB_USER, password: DB_PASSWD, database: DB_DATABASE })
client.connect()

// 💡 [신규] 프론트엔드 테스트를 위한 가상의 카테고리별 선박 데이터
// 💡 개발 및 테스트를 위한 고도화된 Mockup 데이터
const mockDatabase = {
  loitering: [
    // --- 한국 (Korea) 선박 ---
    { mmsi: '440000001', shipname: 'K_FISHING_1', flagcountry: 'Korea', type: 'Fishing', latitude: 36.5123, longitude: 125.8012, sog: 1.2, cog: 145.0, heading: 150.0, posutcmin: 20240310001005, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.88, pred_loitering_type: 0, pred_divergence: 52.14 }, // 0: Oscillatory
    { mmsi: '440000002', shipname: 'K_TUG_ALPHA', flagcountry: 'Korea', type: 'Tug', latitude: 35.1055, longitude: 129.0433, sog: 0.3, cog: 12.0, heading: 10.0, posutcmin: 20240310001012, category: 'loitering', reconstructed: true, pred_loitering: true, pred_loitering_prob: 0.95, pred_loitering_type: 1, pred_divergence: 45.88 }, // 1: Steady
    { mmsi: '440000003', shipname: 'K_CARGO_S', flagcountry: 'Korea', type: 'Cargo', latitude: 34.2011, longitude: 127.5022, sog: 0.8, cog: 270.5, heading: 275.0, posutcmin: 20240310001025, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.76, pred_loitering_type: 5, pred_divergence: 60.12 }, // 5: Hesitant
    { mmsi: '440000004', shipname: 'K_FISHING_2', flagcountry: 'Korea', type: 'Fishing', latitude: 37.4522, longitude: 130.8033, sog: 2.1, cog: 90.0, heading: 88.0, posutcmin: 20240310001030, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.91, pred_loitering_type: 2, pred_divergence: 55.40 }, // 2: Circular
    { mmsi: '440000005', shipname: 'K_PASSENGER_1', flagcountry: 'Korea', type: 'Passenger', latitude: 33.5122, longitude: 126.5233, sog: 0.1, cog: 350.0, heading: 355.0, posutcmin: 20240310001045, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.65, pred_loitering_type: 3, pred_divergence: 48.90 }, // 3: Transition

    // --- 중국 (China) 선박 ---
    { mmsi: '412000001', shipname: 'LU_YU_YU', flagcountry: 'China', type: 'Fishing', latitude: 36.8055, longitude: 124.5022, sog: 1.5, cog: 180.0, heading: 180.0, posutcmin: 20240310001000, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.99, pred_loitering_type: 0, pred_divergence: 58.21 }, // 0: Oscillatory
    { mmsi: '412000002', shipname: 'ZHE_HAI_1', flagcountry: 'China', type: 'Cargo', latitude: 34.0500, longitude: 125.1200, sog: 0.5, cog: 45.0, heading: 50.0, posutcmin: 20240310001015, category: 'loitering', reconstructed: true, pred_loitering: true, pred_loitering_prob: 0.82, pred_loitering_type: 4, pred_divergence: 49.33 }, // 4: Gradual Drift
    { mmsi: '412000003', shipname: 'LIAO_YU_3', flagcountry: 'China', type: 'Fishing', latitude: 37.1022, longitude: 124.8055, sog: 2.8, cog: 310.0, heading: 315.0, posutcmin: 20240310001020, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.87, pred_loitering_type: 2, pred_divergence: 53.64 }, // 2: Circular
    { mmsi: '412000004', shipname: 'MIN_YU_9', flagcountry: 'China', type: 'Fishing', latitude: 33.8055, longitude: 125.5022, sog: 0.4, cog: 200.0, heading: 205.0, posutcmin: 20240310001035, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.74, pred_loitering_type: 5, pred_divergence: 51.05 }, // 5: Hesitant
    { mmsi: '412000005', shipname: 'CN_TANKER_X', flagcountry: 'China', type: 'Tanker', latitude: 34.5022, longitude: 126.1055, sog: 0.2, cog: 110.0, heading: 110.0, posutcmin: 20240310001050, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.68, pred_loitering_type: 1, pred_divergence: 44.12 }, // 1: Steady

    // --- 일본 (Japan) 선박 ---
    { mmsi: '431000001', shipname: 'MARU_FISHING', flagcountry: 'Japan', type: 'Fishing', latitude: 35.5022, longitude: 130.1055, sog: 1.1, cog: 80.0, heading: 85.0, posutcmin: 20240310001002, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.93, pred_loitering_type: 0, pred_divergence: 54.22 }, // 0: Oscillatory
    { mmsi: '431000002', shipname: 'TOKYO_CARGO', flagcountry: 'Japan', type: 'Cargo', latitude: 34.1055, longitude: 128.5022, sog: 0.6, cog: 160.0, heading: 160.0, posutcmin: 20240310001018, category: 'loitering', reconstructed: true, pred_loitering: true, pred_loitering_prob: 0.79, pred_loitering_type: 3, pred_divergence: 47.99 }, // 3: Transition
    { mmsi: '431000003', shipname: 'OSAKA_EXPRESS', flagcountry: 'Japan', type: 'Cargo', latitude: 34.8055, longitude: 129.5022, sog: 0.2, cog: 220.0, heading: 225.0, posutcmin: 20240310001028, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.85, pred_loitering_type: 4, pred_divergence: 50.32 }, // 4: Gradual Drift
    { mmsi: '431000004', shipname: 'J_TUG_BETA', flagcountry: 'Japan', type: 'Tug', latitude: 35.2055, longitude: 129.8022, sog: 0.0, cog: 0.0, heading: 10.0, posutcmin: 20240310001040, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.98, pred_loitering_type: 1, pred_divergence: 42.15 }, // 1: Steady
    { mmsi: '431000005', shipname: 'NIHON_TANKER', flagcountry: 'Japan', type: 'Tanker', latitude: 33.9022, longitude: 127.8055, sog: 1.8, cog: 300.0, heading: 305.0, posutcmin: 20240310001055, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.81, pred_loitering_type: 2, pred_divergence: 56.77 }, // 2: Circular

    // --- 이외 (Others) 국가 선박 ---
    { mmsi: '351000001', shipname: 'PANAMA_STAR', flagcountry: 'Panama', type: 'Cargo', latitude: 34.0055, longitude: 126.5022, sog: 0.3, cog: 10.0, heading: 15.0, posutcmin: 20240310001008, category: 'loitering', reconstructed: true, pred_loitering: true, pred_loitering_prob: 0.72, pred_loitering_type: 4, pred_divergence: 49.88 }, // 4: Gradual Drift
    { mmsi: '636000002', shipname: 'LIBERIA_EAGLE', flagcountry: 'Liberia', type: 'Tanker', latitude: 33.5022, longitude: 125.8055, sog: 0.1, cog: 55.0, heading: 55.0, posutcmin: 20240310001022, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.89, pred_loitering_type: 1, pred_divergence: 43.50 }, // 1: Steady
    { mmsi: '538000003', shipname: 'MARSHALL_VOYAGER', flagcountry: 'Marshall Islands', type: 'Cargo', latitude: 35.8055, longitude: 129.9022, sog: 1.4, cog: 190.0, heading: 195.0, posutcmin: 20240310001032, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.94, pred_loitering_type: 0, pred_divergence: 55.20 }, // 0: Oscillatory
    { mmsi: '563000004', shipname: 'SINGAPORE_WIND', flagcountry: 'Singapore', type: 'Tanker', latitude: 34.3022, longitude: 128.2055, sog: 0.8, cog: 260.0, heading: 265.0, posutcmin: 20240310001042, category: 'loitering', reconstructed: true, pred_loitering: true, pred_loitering_prob: 0.62, pred_loitering_type: 5, pred_divergence: 59.10 }, // 5: Hesitant
    { mmsi: '371000005', shipname: 'HK_EXPRESS', flagcountry: 'Hong Kong', type: 'Cargo', latitude: 34.6055, longitude: 125.2022, sog: 2.2, cog: 135.0, heading: 140.0, posutcmin: 20240310001058, category: 'loitering', reconstructed: false, pred_loitering: true, pred_loitering_prob: 0.86, pred_loitering_type: 2, pred_divergence: 52.90 } // 2: Circular
  ],
  transshipment: [
    { mmsi: '412000222', shipname: 'SUSPECT_B', flagcountry: 'China', type: 'Cargo', latitude: 34.20, longitude: 127.50, sog: 0.1, cog: 45.0, posutcmin: 20240310001000, category: 'transshipment' }
  ],
  illegal: [
    { mmsi: '412000333', shipname: 'SUSPECT_C', flagcountry: 'China', type: 'Fishing', latitude: 37.80, longitude: 124.90, sog: 4.5, cog: 180.0, posutcmin: 20240310001000, category: 'illegal' }
  ],
  delayed: [
    { mmsi: '440555666', shipname: 'SLOW_D', flagcountry: 'Korea', type: 'Tanker', latitude: 34.00, longitude: 128.00, sog: 2.0, cog: 90.0, posutcmin: 20240310001000, category: 'delayed' }
  ]
}

module.exports = function createServicesService () {
  return {
    // ==========================================
    // [01-LVD] 관심지역 의심선박 분류
    // ==========================================
    // getLvdDataService: async ({ start, end }) => {
    //   if (!start || !end) return []
    //   const query = `
    //     WITH distincted AS (
    //       WITH joined AS (
    //         SELECT shipdetails.*, aisdetails.posutcmin, aisdetails.longitude, aisdetails.latitude, aisdetails.cog, aisdetails.navstatuscode
    //         FROM shipdetails
    //         INNER JOIN aisdetails ON shipdetails.mmsi=aisdetails.mmsi 
    //         WHERE flagcountry='Korea'
    //         AND posutcmin > ${start}
    //         AND posutcmin < ${end}
    //         ORDER BY aisdetails.posutcmin DESC
    //         LIMIT 100000
    //       )
    //       SELECT DISTINCT ON (mmsi) * FROM joined
    //     )
    //     SELECT distincted.*, fishingfinal.fnf_bool
    //     FROM distincted
    //     INNER JOIN fishingfinal ON distincted.mmsi=fishingfinal.mmsi AND distincted.posutcmin=fishingfinal.posutcmin AND fishingfinal.fnf_bool=true;
    //   `
    //   const { rows } = await client.query(query)
    //   const loiteringVessel = Array.from(
    //     loitering.reduce((m, v) => {
    //       const existing = m.get(v.mmsi)
    //       if (!existing || new Date(v.time) > new Date(existing.time)) m.set(v.mmsi, v)
    //       return m
    //     }, new Map()).values()
    //   )
    //   loiteringVessel.forEach(v => v.suspected_cls = '3')
    //   return [...rows, ...loiteringVessel]
    // },
    getLvdDataService: async ({ start, end }) => {
      // TODO: 실제 DB 쿼리문 작성 영역
      // if (!start || !end) return []
      return mockDatabase.loitering
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
    // [02-TVD] 환적 의심선박 분류
    // ==========================================
    getTvdDataService: async ({ start, end }) => {
      // TODO: 실제 DB 쿼리문 작성 영역
      return mockDatabase.transshipment
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
    // [05-FPI] IUU 어업패턴 감시 (불법어업)
    // ==========================================
    getFpiDataService: async ({ start, end }) => {
      // TODO: 실제 DB 쿼리문 작성 영역
      return mockDatabase.illegal
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
          console.warn(`AI 서버 404 응답: 해당 선박(${payload.mmsi})의 과거 데이터가 없습니다.`)
          return {
            status: "fail",
            message: "AI 서버에 해당 선박의 궤적 데이터가 존재하지 않습니다."
          }
        }
        // 정상(200)일 경우 AI 서버의 결과값 그대로 반환
        return response.data
      } catch (error) {
        // AI 서버가 아예 꺼져있거나 타임아웃 등 진짜 네트워크 통신 실패일 경우
        console.error("AI 서버 연결 실패:", error.message)
        throw error
      }
    },

    // ==========================================
    // [08-LAVT] 입항지연 선박 추적
    // ==========================================
    getLavtDataService: async ({ start, end }) => {
      // TODO: 실제 DB 쿼리문 작성 영역
      return mockDatabase.delayed
    }
  }
}
