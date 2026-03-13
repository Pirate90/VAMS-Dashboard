<template>
  <transition name="slide-fade">
    <div class="alarm-panel d-flex f-d-column" v-if="show">
      <div class="panel-header">
        <div class="title-area d-flex a-i-center">
          <f-a-icon icon="bell" class="header-icon" />
          <h3>실시간 이상 탐지 알림</h3>
          <span class="unread-count" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </div>
        <button class="btn-close" @click="emit('close')"><f-a-icon icon="x" /></button>
      </div>

      <div class="panel-filters d-flex">
        <button class="active">전체</button>
        <button>심각</button>
        <button>주의</button>
      </div>

      <div class="alarm-list scrollable-content flex-1">
        <div
          class="alarm-card"
          v-for="event in mockEvents"
          :key="event.id"
          :class="{ 'unread': !event.isRead }"
        >
          <div class="card-top d-flex a-i-center">
            <span class="badge" :class="event.category">{{ event.typeLabel }}</span>
            <span class="time">{{ event.timeAgo }}</span>
          </div>

          <div class="card-body" @click="onClickEvent(event)">
            <h4 class="event-title">{{ event.title }}</h4>
            <div class="vessel-info d-flex a-i-center">
              <img src="@/assets/ship-icon.png" alt="ship" class="ship-icon">
              <span class="ship-name">{{ event.shipName }}</span>
              <span class="mmsi">(MMSI: {{ event.mmsi }})</span>
            </div>
          </div>

          <div class="card-bottom d-flex j-c-between a-i-center">
            <span class="zone"><f-a-icon icon="location-dot" class="loc-icon" /> {{ event.zone }}</span>
            <button class="btn-focus" @click.stop="onClickEvent(event)">위치 확인</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'focus-ship', 'update-unread'])

const mockEvents = ref([
  { id: 1, category: 'illegal', typeLabel: '불법어업', risk: 'high', title: '특정금지구역(EEZ) 진입 및 조업 의심', shipName: 'SUSPECT_C', mmsi: '412000333', zone: '동해북방어장', timeAgo: '방금 전', isRead: false, lat: 37.80, lon: 124.90 },
  { id: 2, category: 'transshipment', typeLabel: '환적의심', risk: 'high', title: '해상 초근접 조우 (거리 30m 이내)', shipName: 'SUSPECT_B', mmsi: '412000222', zone: '인천해양경찰서 관할', timeAgo: '3분 전', isRead: false, lat: 34.20, lon: 127.50 },
  { id: 3, category: 'loitering', typeLabel: '배회의심', risk: 'medium', title: '장기 체류 및 원형(Circular) 배회 패턴', shipName: 'UNKNOWN_A', mmsi: '412000111', zone: '가상EEZ', timeAgo: '12분 전', isRead: false, lat: 36.50, lon: 125.80 },
  { id: 4, category: 'delayed', typeLabel: '입항지연', risk: 'low', title: '도착 예정 시간 24시간 초과', shipName: 'SLOW_D', mmsi: '440555666', zone: '857 해구', timeAgo: '1시간 전', isRead: true, lat: 34.00, lon: 128.00 },
  { id: 5, category: 'loitering', typeLabel: '배회의심', risk: 'medium', title: '주저형(Hesitant) 배회 패턴 지속', shipName: 'FISHING_V', mmsi: '440111222', zone: '11-1 해구', timeAgo: '2시간 전', isRead: true, lat: 33.50, lon: 126.50 }
])

const unreadCount = computed(() => mockEvents.value.filter(e => !e.isRead).length)

watch(unreadCount, (newVal) => {
  emit('update-unread', newVal)
}, { immediate: true })

function onClickEvent (event) {
  event.isRead = true
  emit('focus-ship', event)
}
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(100%); opacity: 0; }

.alarm-panel {
  position: absolute; top: 0; right: 0; width: 380px; height: 100%;
  background-color: #1a1a1a; border-left: 1px solid #333;
  box-shadow: -4px 0 15px rgba(0,0,0,0.5); z-index: 2500;
  font-family: 'SUIT', sans-serif;
}

/* 💡 X 버튼 우측 끝 정렬 완벽 해결 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 양끝으로 밀어내기 */
  padding: 20px;
  border-bottom: 1px solid #2a2a2a;
  background-color: #1a1a1a;
}
.title-area h3 { margin: 0 8px 0 6px; font-size: 16px; font-weight: 700; color: #fff; }
.header-icon { color: #F59E0B; font-size: 18px; }
.unread-count {
  background: #EF4444; color: #fff; font-size: 12px; font-weight: 800;
  padding: 2px 8px; border-radius: 12px;
}
.btn-close {
  background: none; border: none; color: #888; cursor: pointer; font-size: 18px;
  margin-left: auto; /* 여백을 강제로 밀어 확실하게 우측 정렬 */
}
.btn-close:hover { color: #fff; }

.panel-filters { background: #1a1a1a; padding: 12px 20px; gap: 10px; border-bottom: 1px solid #2a2a2a; }
.panel-filters button {
  background: transparent; border: 1px solid #444; color: #aaa;
  padding: 6px 14px; border-radius: 15px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.panel-filters button.active, .panel-filters button:hover {
  background: #4A5568; border-color: #4A5568; color: #fff;
}

.alarm-list { padding: 15px; overflow-y: auto; background-color: #151515; }

.alarm-card {
  background: #222222; border: 1px solid #333; border-radius: 8px;
  padding: 16px; margin-bottom: 12px; transition: all 0.2s;
  position: relative; overflow: hidden;
}
.alarm-card:hover { background: #2a2a2a; border-color: #555; }
.alarm-card.unread::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background-color: #EF4444;
}

.card-top { gap: 8px; margin-bottom: 10px; }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; color: #fff; }
.badge.loitering { background: #F59E0B; }
.badge.transshipment { background: #EA580C; }
.badge.illegal { background: #EF4444; }
.badge.delayed { background: #6B7280; }

.time { font-size: 12px; color: #888; font-weight: 500; }

.card-body { cursor: pointer; }
.event-title { margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #eee; line-height: 1.4; word-break: keep-all; }
.vessel-info { gap: 6px; margin-bottom: 15px; }
.ship-icon { width: 14px; opacity: 0.7; filter: invert(1); }
.ship-name { font-size: 13px; font-weight: 600; color: #ddd; }
.mmsi { font-size: 12px; color: #777; }

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-top: 1px dashed #444;
  padding-top: 12px
}
.loc-icon { color: #888; margin-right: 4px; }
.zone { font-size: 12px; color: #aaa; }

/* 💡 위치 확인 버튼 강조 (솔리드 블루) */
.btn-focus {
  margin-left: auto;
  background-color: #3B82F6; /* 밝은 파란색으로 변경 */
  border: none;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 800;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4); /* 은은한 파란 그림자 */
}
.alarm-card:hover .btn-focus {
  background-color: #2563EB; /* 호버 시 더 진한 파란색 */
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.6);
  transform: scale(1.05); /* 살짝 커지는 애니메이션 */
}
</style>
