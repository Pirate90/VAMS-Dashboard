export default function createTracingApi (http) {
  return {
    getList: async () => {
      const { data } = await http.get('/tracing/list')
      return data
    }
  }
}
