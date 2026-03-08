<template>
  <div v-if="show" class="custom-context-menu" :style="{ top: y + 'px', left: x + 'px' }">
    <div class="menu-header">
      <span class="coord-text">{{ coord[0].toFixed(5) }}, {{ coord[1].toFixed(5) }}</span>
      <button class="close-btn" @click="$emit('close')">✕</button>
    </div>
    <ul class="menu-list">
      <li v-for="(item, index) in items" :key="index" class="menu-item" @click="$emit('select', item)">
        <span class="badge" :class="item.type">{{ item.typeLabel }}</span>
        <span class="info">{{ item.value }}</span>
      </li>
      <li v-if="items.length === 0" class="menu-item empty">
        해당 위치에 탐지된 구역 정보가 없습니다.
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  x: Number,
  y: Number,
  coord: Array,
  items: Array
})
defineEmits(['close', 'select'])
</script>

<style scoped>
.custom-context-menu {
  position: absolute; z-index: 10000; width: 220px;
  background-color: #222; border: 1px solid #444; border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-family: 'SUIT', sans-serif;
}
.menu-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 10px; background: #111; border-bottom: 1px solid #333;
}
.coord-text { font-size: 10px; color: #777; font-family: monospace; }
.close-btn { background: none; border: none; color: #777; cursor: pointer; font-size: 12px; }
.menu-list { list-style: none; margin: 0; padding: 4px 0; }
.menu-item {
  display: flex; align-items: center; padding: 8px 12px;
  color: #ddd; font-size: 13px; cursor: pointer;
}
.menu-item:hover { background-color: #333; }
.menu-item.empty { color: #555; font-size: 12px; justify-content: center; cursor: default; }

.badge {
  padding: 2px 5px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-right: 8px; color: #fff;
}
.badge.district { background-color: #3b82f6; }   /* 일반 구역 */
.badge.coastguard { background-color: #10b981; } /* 해경 관할 */
.badge.trench-lg { background-color: #f59e0b; }  /* 대해구 */
.badge.trench-sm { background-color: #8b5cf6; }  /* 소해구 */

.info { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
