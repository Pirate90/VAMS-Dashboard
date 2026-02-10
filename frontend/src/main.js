import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@vuepic/vue-datepicker/dist/main.css'
import 'ol/ol.css'
import 'maptalks/dist/maptalks.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

const app = createApp(App)
app.component('f-a-icon', FontAwesomeIcon)
app.use(router).mount('#app')
