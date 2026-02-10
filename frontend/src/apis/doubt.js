export default function createDoubtApi (http) {
  return {
    getData: async (start, end) => {
      const { data } = await http.get('/doubt', { params: { start, end } })
      return data
    },

    getList: async (start, end) => {
      const { data } = await http.get('/doubt/list', { params: { start, end } })
      return data
    },

    getDataByDate: async (start, end) => {
      const { data } = await http.get('/doubt/bydate', { params: { start, end } })
      return data
    },

    getMinMaxDate: async () => {
      const { data } = await http.get('/doubt/minmaxdate')
      return data
    },

    getMinMaxDateByVessel: async (mmsi) => {
      const { data } = await http.get('/doubt/minmaxdate', { params: { mmsi } })
      return data
    },

    getHistogram: async (start, end, unit) => {
      const { data } = await http.get('/doubt/histogram', { params: { start, end, unit } })
      return data
    },

    getTrajectory: async (mmsi, start, end) => {
      const { data } = await http.get('/doubt/trajectory', { params: { mmsi, start, end } })
      return data
    },

    getLoiteringVessel: async () => {
      const { data } = await http.get('/doubt/loitering')
      return data
    }
  }
}
