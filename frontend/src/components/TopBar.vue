<template>
  <div class="topbar">
    <img :src="require('@/assets/logo-full.png')" alt="">
    <!-- <img :src="require('@/assets/cg-logo.png')" alt=""> -->
    <nav>
      <span v-for="n in navList" :key="n.name">{{ n.name }}</span>
    </nav>
  </div>
</template>

<script setup>
const navList = [
  { name: '선박 활동 이벤트', route: '' },
  { name: '이동 경로 궤적', route: '' },
  { name: '선박 조업 현황', route: '' },
  { name: '선박 조업 식별', route: '' }
]
</script>

<style>
.topbar {
  width: 100%;
  height: 60px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  /* background-color: #acaec9; */
}
.topbar > img {
  margin-top: 5px;
  height: 30px;
}
.topbar > nav {
  margin-left: 80px;
  display: flex;
  gap: 40px;
}
.topbar > nav > span {
  font: normal normal bold 18px/20px SUIT;
  letter-spacing: -0.9px;
  color: #AAAAAA;
}
.topbar > nav > span:hover {
  color: #275FCE;
  cursor: pointer;
}
</style>
