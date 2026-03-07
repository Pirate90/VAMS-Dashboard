// src/apis/workflow.js
const server = '143.248.230.55'
const port = '3000'
const baseUrl = `http://${server}:${port}/api/components`

export default function createWorkflowApi (http) {
  return {
    // ---------------------------------------------
    // [ ROIC 그룹 ] - LVD(의심선박), TVD(환적) 등
    // ---------------------------------------------
    roic: {
      reqJob: async (start, end) => {
        const { data } = await http.post(`${baseUrl}/roic/svc/jobs`, { analysis_start_utcmin: start, analysis_end_utcmin: end })
        return data
      },
      reqSchedule: async (schedule) => {
        const { data } = await http.post(`${baseUrl}/roic/svc/schedules`, { cronjob_expr_format: schedule })
        return data
      },
      getList: async () => {
        const { data } = await http.get(`${baseUrl}/roic/svc/jobs`)
        return data
      },
      getResult: async (jobId) => {
        const { data } = await http.get(`${baseUrl}/roic/svc/jobs/${jobId}/results`)
        return data
      }
    },

    // ---------------------------------------------
    // [ IUFM 그룹 ] - FAC, FGVD, FPI (어업/조업 관련)
    // ---------------------------------------------
    iufm: {
      reqJob: async (type, start, end) => {
        const { data } = await http.post(`${baseUrl}/iufm/${type}/jobs`, { analysis_start_utcmin: start, analysis_end_utcmin: end })
        return data
      },
      reqSchedule: async (type, schedule) => {
        const { data } = await http.post(`${baseUrl}/iufm/${type}/schedules`, { cronjob_expr_format: schedule })
        return data
      },
      getList: async (type) => {
        const { data } = await http.get(`${baseUrl}/iufm/${type}/jobs`)
        return data
      },
      getResult: async (type, jobId) => {
        const { data } = await http.get(`${baseUrl}/iufm/${type}/jobs/${jobId}/results`)
        return data
      }
    },

    // ---------------------------------------------
    // [ IUVT 그룹 ] - SVT, MVT, LAVT (추적/예측 관련)
    // ---------------------------------------------
    iuvt: {
      reqPredict: async (start, end, predict) => {
        // 경로가 기존과 약간 다름 (/api/iuvt/vts...)
        const { data } = await http.post(`http://${server}:${port}/api/iuvt/vts/inferences/trajectory`, {
          start_posutcmin: start, end_posutcmin: end, predict_posutcmin: predict
        })
        return data
      },
      getPredictResult: async (pId) => {
        const { data } = await http.get(`http://${server}:${port}/api/iuvt/vts/inferences/trajectory/${pId}`)
        return data
      }
    }
  }
}
