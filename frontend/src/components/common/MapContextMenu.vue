<template>
  <div v-if="show" class="custom-context-menu" :style="{ top: y + 'px', left: x + 'px' }">
    <div class="menu-header">
      <span class="coord-text">{{ coord[0].toFixed(5) }}, {{ coord[1].toFixed(5) }}</span>
      <button class="close-btn" @click="closeMenu">✕</button>
    </div>
    <ul class="menu-list">
      <li v-for="(item, index) in items" :key="index" class="menu-item-container">
        <div class="menu-item" @click="onItemClick(item)">
          <span class="badge" :class="item.type">{{ item.typeLabel }}</span>
          <span class="info">{{ item.value }}</span>
        </div>
        <div v-if="expandedItem === item" class="stats-actions">
          <button class="stat-btn" @click="$emit('stats', { period: 'daily', item })">일간</button>
          <button class="stat-btn" @click="$emit('stats', { period: 'weekly', item })">주간</button>
          <button class="stat-btn" @click="$emit('stats', { period: 'monthly', item })">월간</button>
        </div>
      </li>
      <li v-if="items.length === 0" class="menu-item empty">
        해당 위치에 정보가 없습니다.
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  x: Number,
  y: Number,
  coord: Array,
  items: Array
})

const emit = defineEmits(['close', 'select', 'stats'])

const expandedItem = ref(null)

// 💡 좌표가 바뀌거나 메뉴가 닫히면 확장 상태 초기화
watch(() => props.show, (newVal) => {
  if (!newVal) expandedItem.value = null
})
watch(() => props.coord, () => {
  expandedItem.value = null
})

const closeMenu = () => {
  expandedItem.value = null
  emit('close')
}

const onItemClick = (item) => {
  // 클릭 시 아코디언 토글
  expandedItem.value = expandedItem.value === item ? null : item
  // MainMap으로 점멸 이벤트 트리거
  emit('select', item)
}
</script>

<style scoped>
.custom-context-menu {
  position: absolute;
  z-index: 10000;
  width: 250px;
  background-color: #222222;
  border: 1px solid #444;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  font-family: 'SUIT', sans-serif;
  overflow: hidden;
}
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: #111111;
  border-bottom: 1px solid #333;
}
.coord-text { font-size: 10px; color: #777; font-family: monospace; }
.close-btn { background: none; border: none; color: #777; cursor: pointer; font-size: 12px; }
.menu-list { list-style: none; margin: 0; padding: 0; }

.menu-item-container { border-bottom: 1px solid #333; }
.menu-item-container:last-child { border-bottom: none; }

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.menu-item:hover { background-color: #333; }
.menu-item.empty { color: #555; font-size: 12px; justify-content: center; cursor: default; }

.badge { padding: 3px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-right: 8px; color: #fff; }
.badge.district { background-color: #3b82f6; }
.badge.coastguard { background-color: #10b981; }
.badge.trench-lg { background-color: #f59e0b; }
.badge.trench-sm { background-color: #8b5cf6; }
.info { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 💡 추가된 통계 버튼 패널 스타일 */
.stats-actions {
  display: flex;
  justify-content: space-between;
  background: #1a1a1a;
  padding: 8px 10px;
  gap: 6px;
}
.stat-btn {
  flex: 1;
  padding: 6px 0;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #ccc;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.stat-btn:hover {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
</style>
