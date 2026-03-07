<template>
  <div class="loading d-flex j-c-center a-i-center">
    <f-a-icon class="spinner" icon="spinner"/>
  </div>
</template>

<style scoped>
.loading {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.6);
  top: 0;
  left: 0;
}
.spinner {
  color: white;
  font-size: 70px;
  animation-name: spin;
  animation-duration: 5000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
