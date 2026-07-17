<script setup>
import { ref } from 'vue'

const count = ref(0)

</script>

<template>
  <h1>Hello Vue 3!流式</h1>
  <button @click="count++">点击我</button>
  <div class="app">
    <h1>Vue + Vite</h1>
    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}
</style>
