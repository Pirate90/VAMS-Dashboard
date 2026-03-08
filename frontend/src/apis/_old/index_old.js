import axios from 'axios'
import createDoubtApi from './doubt'
import createIuuApi from './iuu'
import createDistrictmapApi from './districtmap'
import createRequestApi from './request'
import createTracingApi from './tracing'

export async function getTrenchmap (type) {
  const { data } = await axios.get(`/trenchmap/${type}.geojson`)
  return data
}

export const doubtApi = createDoubtApi(axios)
export const iuuApi = createIuuApi(axios)
export const districtmapApi = createDistrictmapApi(axios)
export const requestApi = createRequestApi(axios)
export const tracingApi = createTracingApi(axios)
