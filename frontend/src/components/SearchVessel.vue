<template>
  <div class="search">
    <button @click="onClickSearch" :class="['btn-transition', toggleSearch ? '' : 'btn-transition-delay']" :style="btnStyle">
      <img :src="require('@/assets/search-white.png')" alt="">
    </button>

    <Transition name="slide">
      <div class="detail" v-if="toggleSearch">
        <section class="searching">
          <input type="text" placeholder="선박 번호 조회">
          <button><img :src="require('@/assets/search-blue.png')" alt=""></button>
        </section>

        <section class="filter">
          <div class="title">유형 선택</div>
          <div class="container">
            <div class="content" v-for="f in filters" :key="f.name">
              <div class="title">{{ f.name }}</div>
              <div class="btn-group">
                <button :style="{ width: `calc(100% / ${f.list.length} - 5px)` }" v-for="l in f.list" :key="l">{{ l }}</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filters = [
  { name: '채집 종류', list: ['통발', '자망', '연승', '선망', '저인망'] },
  { name: '채집 위치', list: ['전체', '동쪽', '서쪽', '남쪽'] }
]

const toggleSearch = ref(false)

const btnStyle = computed(() => {
  if (toggleSearch.value) return { borderRadius: '15px 0 0 15px' }
  return { borderRadius: '15px' }
})

function onClickSearch () {
  toggleSearch.value = !toggleSearch.value
}
</script>

<style scoped>
.search {
  position: absolute;
  left: 30px;
  top: 30px;
  display: flex;
}
.btn-transition {
  transition: border-radius 0.2s ease-in;
}
.btn-transition-delay {
  transition-delay: 0.1s;
}
.search > button {
  width: 50px;
  height: 50px;
  background: #275FCE;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}
.search > button:hover {
  cursor: pointer;
  background: #4075dd;
}
.search > button > img {
  width: 25px;
  height: 25px;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
  max-width: 480px;
  max-height: 500px;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-width: 0;
  max-height: 0;
}
.detail {
  width: 480px;
  height: 500px;
  background: #ffffff;
  /* border-radius: 0 15px 15px 15px; */
  border: 1px solid #275FCE;
  text-wrap: nowrap;
}
.searching {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid #858585;
  display: flex;
  align-items: center;
}
.searching > input {
  height: 100%;
  flex: 1;
  padding: 0 10px;
  border: none;
  font: normal normal bold 18px/20px SUIT;
  letter-spacing: -0.9px;
  color: #333333;
}
.searching > input:focus {
  outline: none;
}
.searching > button {
  width: 50px;
  height: 50px;
  border: none;
  background: none;
  cursor: pointer;
}
.searching > button > img {
  width: 50%;
  height: 50%;
}
.searching > button:hover img {
  opacity: 0.8;
}
.filter {
  padding: 10px;
}
.filter > .title {
  font: normal normal bold 18px/20px SUIT;
  letter-spacing: -0.9px;
  color: #333333;
  margin-bottom: 10px;
}
.filter > .container {
  background: #EEF7FF;
  padding: 15px 10px;
}
.filter > .container > .content {
  margin-bottom: 10px;
}
.filter > .container > .content > .title {
  margin-bottom: 5px;
  font: normal normal bold 15px/20px SUIT;
  letter-spacing: -0.75px;
  color: #333333;
}
.filter > .container > .content > .btn-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.filter > .container > .content > .btn-group > button {
  background: #FFFFFF;
  border: 1px solid #BBBBBB;
  border-radius: 2px;
  font: normal normal 600 14px/20px SUIT;
  letter-spacing: -0.35px;
  color: #666666;
  width: 80px;
  height: 35px;
}
.filter > .container > .content > .btn-group > button:hover {
  background: #275FCE;
  cursor: pointer;
  color: #ffffff;
}
</style>
