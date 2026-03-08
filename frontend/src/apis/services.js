// src/apis/services.js
export default function createVamsServicesApi (http) {
  return {
    // 1. LVD: 관심지역 의심선박 분류
    '01-lvd': {
      getHistogram: async (start, end, unit) => {
        const { data } = await http.get('/services/01-lvd/histogram', { params: { start, end, unit } })
        return data
      },
      getLoiteringVessel: async () => {
        const { data } = await http.get('/services/01-lvd/loitering')
        return data
      }
    },
    // 2. TVD: 환적 의심선박 분류
    '02-tvd': {},

    // 3. FAC: 조업/비조업 자동식별
    '03-fac': {},

    // 4. FGVD: 불법조업구역 추정
    '04-fgvd': {},

    // 5. FPI: IUU 어업패턴 감시
    '05-fpi': {},

    // 6. SVT: 의심선박 시공간 추적 (기존 tracing)
    '06-svt': {
      getList: async () => {
        const { data } = await http.get('/services/06-svt/list')
        return data
      },
      // 궤적 예측 요청 API
      predict: async (payload) => {
        const { data } = await http.post('/services/06-svt/predict', payload)
        return data
      }
    },

    // 7. MVT: 다중선박 이동범위 추정
    '07-mvt': {},

    // 8. LAVT: 입항지연 선박 추적
    '08-lavt': {},

    // 9. LGVD: VLM 기반 선박활동 설명
    '09-lgvd': {},

    // 10. LVAD: LLM 기반 불법어업 근거 (기존 하드코딩 문서작성 확인 로직)
    '10-lvad': {
      getExplanation: async () => {
        // 💡 실제 백엔드 연동 시 아래 하드코딩 부분을 지우고 다음과 같이 사용하시면 됩니다.
        // const { data } = await http.get('/services/10-lvad/explanation')
        // return data
        return {
          answer: '2024년 2월 30일 현재, \'440076830\' 번호 선박이 위경도 34.67095833, 128.57568167 에 해당하는 해역 위치를 지나고 있다. 해당 선박의 어업경로의 패턴을 분석한 결과 저인망 어업을 행하는 것으로 분석하였다. \n\n수산업법 시행령 별표 5에 따르면...',
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
            { page: 5, source: './doc_law/배타적 경제수역에서의 외국인어업 등에 대한 주권적 권리의 행사에 관한 법률 시행령(대통령령)(제33225호)(20230112).pdf' }
          ]
        }
      }
    }
  }
}
