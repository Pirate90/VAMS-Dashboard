export default function createDistrictmapApi (http) {
  return {
    get: async (type) => {
      const { data } = await http.get(`/districtmap/${encodeURIComponent(type)}.geojson`)
      return data
    },

    list: async () => {
      const { data } = await http.get('/districtmap/list')
      return data
    }
  }
}
