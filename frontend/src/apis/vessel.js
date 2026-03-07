// src/apis/vessel.js
export default function createVesselApi (http) {
  return {
    // 1. 선박 기본 데이터 및 리스트
    getData: async (start, end) => {
      const { data } = await http.get('/vessel/data', { params: { start, end } })
      return data
    },
    getList: async (start, end) => {
      const { data } = await http.get('/vessel/list', { params: { start, end } })
      return data
    },
    getDataByDate: async (start, end) => {
      const { data } = await http.get('/vessel/bydate', { params: { start, end } })
      return data
    },

    // 2. 궤적 정보
    getTrajectory: async (mmsi, start, end) => {
      const { data } = await http.get('/vessel/trajectory', { params: { mmsi, start, end } })
      return data
    },

    // 3. 날짜 관련 쿼리
    getMinMaxDate: async () => {
      const { data } = await http.get('/vessel/minmaxdate')
      return data
    },
    getMinMaxDateByVessel: async (mmsi) => {
      const { data } = await http.get('/vessel/minmaxdate', { params: { mmsi } })
      return data
    }
  }
}
