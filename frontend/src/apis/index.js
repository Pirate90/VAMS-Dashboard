// src/apis/index.js
import axios from 'axios'

// 각 기능별 팩토리 함수 임포트
import createVesselApi from './vessel'
import createVamsServicesApi from './services'
import createWorkflowApi from './workflow'
import createDistrictmapApi from './districtmap'

// 해구도 조회 (단일 함수 형태 유지)
export async function getTrenchmap (type) {
  const { data } = await axios.get(`/trenchmap/${type}.geojson`)
  return data
}

// API 인스턴스 생성 및 Export
export const vesselApi = createVesselApi(axios)
export const servicesApi = createVamsServicesApi(axios)
export const workflowApi = createWorkflowApi(axios)
export const districtmapApi = createDistrictmapApi(axios)
