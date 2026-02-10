<template>
  <section class="main">
    <div class="content" v-for="i in imgList" :key="i.name">
      <div class="info">
        <div class="title" :title="i.name">{{ i.name }}</div>
        <div>
          <button :disabled="currentImg === i.name && currentType === 'convert'" @click="onClickImg(i, 'convert')">Show</button>
          <button :disabled="currentImg === i.name && currentType === 'bbox'" @click="onClickImg(i, 'bbox')">Bbox</button>
          <button @click="onClickImg(i, 'result')" style="width: 100px;">MV-Tracing</button>
        </div>
      </div>
      <img :src="`/tracing/img/${i.name}/convert.jpg`" alt="">
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, defineEmits } from 'vue'
import { tracingApi } from '@/apis'

const emit = defineEmits(['img:display'])

const imgList = ref([])
const currentImg = ref('')
const currentType = ref('')

onMounted(async () => {
  imgList.value = await tracingApi.getList()
})

function onClickImg (i, type) {
  if (type !== 'result') {
    currentImg.value = i.name
    currentType.value = type
  }
  emit('img:display', i, type)
}
</script>

<style scoped>
section {
  position: absolute;
  top: 40px;
  left: 0;
  height: calc(100% - 40px);
  width: 400px;
  background: #222;
  border-top: 1px solid #7a7a7a;
  box-shadow: 0 0 2px #fff;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.content {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 20px;
}
.content:not(:last-child) {
  border-bottom: 1px solid #fff;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title {
  font: normal normal 600 15px/20px SUIT;
  letter-spacing: -0.75px;
  color: #fff;
  overflow-x: hidden;
  white-space: normal; /* 기본값: 자동 줄바꿈 */
  word-break: break-word; /* 단어 단위 줄바꿈 허용 */
  /* white-space: nowrap;
  text-overflow: ellipsis; */
}

.info > div > button {
  height: 25px;
  width: 80px;
  border: 1px solid #656565;
  border-radius: 13px;
  background: #222222;
  font: normal normal 600 14px/20px SUIT;
  letter-spacing: -0.75px;
  color: #828282;
  transition: all .2s;
  margin: 3px 3px;
}
.info > div > button:hover {
  cursor: pointer;
  background: #757575;
  color: #ffffff;
}
.info > div > button:disabled {
  background: #757575;
  color: #ffffff;
  cursor: auto;
}

img {
  flex: 1;
  width: 150px;
  height: 150px;
}
</style>
