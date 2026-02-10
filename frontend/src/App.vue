<template>
  <SideMenu v-if="route.path !== '/login'"></SideMenu>
  <router-view style="height: 100%; flex: 1;"/>
</template>

<script setup>
import { useRoute } from 'vue-router'
import SideMenu from '@/components/SideMenu'

const route = useRoute()
</script>

<style>
@import url("//fonts.googleapis.com/earlyaccess/notosanskr.css");
@import url('https://webfontworld.github.io/SCoreDream/SCoreDream.css');
@font-face {
  font-family: 'Dokrip';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Dokrip.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'SUIT-Regular';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#app {
  font-family: "Noto Sans KR", sans-serif;
  display: flex;

  /* no select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.d-flex {
  display: flex;
}
.j-c-center {
  justify-content: center;
}
.a-i-center {
  align-items: center;
}
.f-d-column {
  flex-direction: column;
}
.flex-1 {
  flex: 1;
}
</style>
