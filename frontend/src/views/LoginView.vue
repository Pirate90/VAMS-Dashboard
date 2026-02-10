<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">로그인</h2>
      <div class="form-group">
        <label for="id">아이디</label>
        <input id="id" v-model="id" type="text" placeholder="ID" />
      </div>
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input id="password" v-model="password" type="password" placeholder="PASSWORD" />
      </div>
      <button class="login-button" @click="onClickLogin">접속</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const id = ref('')
const password = ref('')

function onClickLogin () {
  if (id.value === 'admin' && password.value === 'qwer1234') {
    document.cookie = 'token=abc123; max-age=600; path=/'
    router.replace('/')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f4f8;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  width: 300px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  padding: 10px;
  background-color: #004aad;
  color: white;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.login-button:hover {
  background-color: #003380;
}
</style>
