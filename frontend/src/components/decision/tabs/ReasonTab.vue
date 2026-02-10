<template>
  <div class="reason">
    <div class="block" style="margin-bottom: 10px;">
      <div class="d-flex info" style="margin-bottom: 10px;">
        <label for="type">식별된 어선 조업행태</label>
        <input type="text" id="type" v-model="type" disabled>
      </div>
      <div class="d-flex info">
        <label for="access">허가조업 현황</label>
        <input type="text" id="access" v-model="access" disabled>
      </div>
    </div>

    <div class="block d-flex imgs" style="margin-bottom: 10px;">
      <img :src="require('@/assets/reason1.png')" alt="">
      <img :src="require('@/assets/reason2.png')" alt="">
    </div>

    <div class="block" style="margin-bottom: 10px;">
      <div>불법판단 근거</div>
      <div>
        위경도 (35.912156, 129.814206) 지역은 부산광역시의 연안해역에 해당하며, 본 지역은 '외끌이대형저인망어업의 조업금지구역'에 포함되는 것으로 보입니다. 본 지역에서 저인망어업을 행하는
        것은 '수산자원관리법 시행령 [별표 3]'의 조업금지구역에 해당하므로, 440076830 선박이 행한 저인망어업 행태는 불법인 것으로 파악됩니다.
      </div>
    </div>

    <div class="block">
      <div>참고 법규 문건</div>
      <div>
        1. 수산자원관리법 시행령(대통령령)(제34777호) <br>
        2. 수산업법 시행령(대통령령)(제34550호)
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const type = ref('저인망')
const access = ref('통발(부산광역시 해역)')
</script>

<style scoped>
.reason {
  padding: 10px 15px;
  height: 475px;
  overflow: auto;
}
.block {
  border: 1px solid #bbbbbb;
  border-radius: 10px;
  padding: 10px;
}
.info {
  justify-content: space-between;
}
.info > input[type=text] {
  text-align: center;
}
.imgs {
  justify-content: space-between;
}
.imgs > img {
  width: 49%;
}
</style>
