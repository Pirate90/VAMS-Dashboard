export default function createIuuApi (http) {
  return {
    getData: async (start, end) => {
      const { data } = await http.get('/iuu', { params: { start, end } })
      return data
    },

    getList: async (start, end) => {
      const { data } = await http.get('/iuu/list', { params: { start, end } })
      return data
    },

    getMinMaxDate: async () => {
      const { data } = await http.get('/iuu/minmaxdate')
      return data
    },

    getTrajectory: async (mmsi, start, end) => {
      const { data } = await http.get('/iuu/trajectory', { params: { mmsi, start, end } })
      return data
    }
  }
}
