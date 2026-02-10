<template>
  <div class="config d-flex">
    <span class="title">Heatmap Config</span>
    <span class="content d-flex a-i-center">
      <label for="radius">Radius</label>
      <span>
        <span>{{ radius }}</span>
        <input type="range" name="" id="radius" step="1" min="0" max="20" v-model="radius"
        @input="emit('config:change', 'radius', radius)"
        >
      </span>
    </span>
    <span class="content d-flex a-i-center">
      <label for="blur">Blur</label>
      <span>
        <span>{{ blur }}</span>
        <input type="range" name="" id="blur" step="1" min="0" max="30" v-model="blur"
          @input="emit('config:change', 'blur', blur)"
        >
      </span>
    </span>
    <span class="content d-flex a-i-center">
      <label for="opacity">Opacity</label>
      <span>
        <span>{{ opacity }}</span>
        <input type="range" name="" id="opacity" step="0.1" min="0" max="1" v-model="opacity"
          @input="emit('config:change', 'opacity', opacity)"
        >
      </span>
    </span>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue'

const emit = defineEmits(['config:change'])

const radius = ref(11)
const blur = ref(20)
const opacity = ref(0.8)
</script>

<style scoped>
.config {
  position: absolute;
  top: 50px;
  left: 10px;
  flex-direction: column;
  gap: 10px;
  background-color: #292929;
  padding: 10px;
  box-shadow: 0 0 3px #393939;
  border-radius: 10px;
}
.title, label, .content > span {
  color: #ffffff;
  font: normal normal 700 16px/20px SUIT;
}
.content {
  justify-content: space-between;
  gap: 10px;
}
.content > span > span {
  display: inline-block;
  width: 25px;
  margin: 0 5px;
  text-align: right;
}
</style>
