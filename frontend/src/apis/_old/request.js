const server = '143.248.230.55'
const port = '3000'

export default function createRequestApi (http) {
  return {
    reqDoubt: async (start, end) => {
      const { data } = await http.post(`http://${server}:${port}/api/components/roic/svc/jobs`, { analysis_start_utcmin: start, analysis_end_utcmin: end })
      return data
    },
    reqDoubtSchedule: async (schedule) => {
      const { data } = await http.post(`http://${server}:${port}/api/components/roic/svc/schedules`, { cronjob_expr_format: schedule })
      return data
    },
    getDoubtList: async () => {
      const { data } = await http.get(`http://${server}:${port}/api/components/roic/svc/jobs`)
      return data
    },
    getDoubtResult: async (jobId) => {
      const { data } = await http.get(`http://${server}:${port}/api/components/roic/svc/jobs/${jobId}/results`)
      return data
    },

    reqIuu: async (type, start, end) => {
      const { data } = await http.post(`http://${server}:${port}/api/components/iufm/${type}/jobs`, { analysis_start_utcmin: start, analysis_end_utcmin: end })
      return data
    },
    reqIuuSchedule: async (type, schedule) => {
      const { data } = await http.post(`http://${server}:${port}/api/components/iufm/${type}/schedules`, { cronjob_expr_format: schedule })
      return data
    },
    getIuuList: async (type) => {
      const { data } = await http.get(`http://${server}:${port}/api/components/iufm/${type}/jobs`)
      return data
    },
    getIuuResult: async (type, jobId) => {
      const { data } = await http.get(`http://${server}:${port}/api/components/iufm/${type}/jobs/${jobId}/results`)
      return data
    },

    reqPredict: async (start, end, predict) => {
      const { data } = await http.post(`http://${server}:${port}/api/iuvt/vts/inferences/trajectory`, {
        start_posutcmin: start, end_posutcmin: end, predict_posutcmin: predict
      })
      return data
    },
    getPredictResult: async (pId) => {
      const { data } = await http.get(`http://${server}:${port}/api/iuvt/vts/inferences/trajectory/${pId}`)
      return data
    },

    // 문서작성 확인
    reqPredectRange: async () => {},
    getPrediceRangeResult: async () => {},

    getExplanation: async () => {
      return {
        answer: '2024년 2월 30일 현재, \'440076830\' 번호 선박이 위경도 34.67095833, 128.57568167 에 해당하는 해역 위치를 지나고 있다. 해당 선박의 어업경로의 패턴을 분석한 결과 저인망 어업을 행하는 것으로 분석하였다. \n\n수산업법 시행령 별표 5에 따르면, 외끌이대형저인망어업 및 쌍끌이대형저인망어업은 경상남도해안선과 동경 127도 59분 52.21초 선의 교점, 북위 33도 20분 11.80초 동경 127도 59분 52.25초의 교점, 북위 33도 30분 11.77초 동경 129도 49분 51.68초의 교점을 차례대로 연결한 이북의 동해를 제외한 서해와 동중국해에서 허가받을 수 있다. \n\n그러나, 해당 선박이 지나고 있는 해역 위치는 위경도 34.67095833, 128.57568167로 수산자원관리법 시행령 별표 10에 따르면, 근해형망어업의 조업금지구역으로 규정되어 있다. 따라서, 해당 선박은 저인망 어업을 행할 수 없다. \n\n결론적으로, \'440076830\' 번호 선박은 해당 해역 위치에서 저인망 어업을 행할 수 없다. 따라서, 해당 선박은 다른 어업을 행하거나, 다른 해역으로 이동하여야 한다.',
        traj: ['lon', 'lat'],
        image_path: '/images/image1.png',
        sources: [
          { page: 119, source: './doc_law/수산업법 시행령(대통령령)(제34550호)(20240608).pdf' },
          { page: 1, source: './doc_law/수산자원관리법 시행규칙(해양수산부령)(제00666호)(20240501).pdf' },
          { page: 5, source: './doc_law/수산업법 시행령(대통령령)(제34550호)(20240608).pdf' },
          { page: 49, source: './doc_law/수산업법 시행규칙(해양수산부령)(제00649호)(20240124).pdf' },
          { page: 68, source: './doc_law/수산자원관리법 시행령(대통령령)(제34777호)(20240730).pdf' },
          { page: 129, source: './doc_law/수산업법 시행령(대통령령)(제34550호)(20240608).pdf' },
          { page: 51, source: './doc_law/수산자원관리법 시행령(대통령령)(제34777호)(20240730).pdf' },
          { page: 123, source: './doc_law/수산업법 시행령(대통령령)(제34550호)(20240608).pdf' },
          { page: 36, source: './doc_law/수산자원관리법 시행령(대통령령)(제34777호)(20240730).pdf' },
          { page: 5, source: './doc_law/배타적 경제수역에서의 외국인어업 등에 대한 주권적 권리의 행사에 관한 법률 시행령(대통령령)(제33225호)(20230112).pdf' }]
      }
    }
  }
}
