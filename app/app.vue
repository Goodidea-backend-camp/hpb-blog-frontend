<!-- 以下僅為測試使用，實際使用時請刪除 -->

<template>
  <div>
    <h1>HPB Blog Frontend</h1>
    <p>
      Message from backend: <strong>{{ data || 'Loading...' }}</strong>
    </p>
    <p v-if="error">Error: {{ error.message }}</p>
  </div>
</template>

<script setup>
const { data, error } = await useFetch('/api/')

if (error.value) {
  console.error('Failed to fetch from backend:', error.value)
}
</script>

<style scoped>
body {
  font-family: sans-serif;
  padding: 2rem;
  background-color: #f4f4f9;
  color: #333;
}
h1 {
  color: #0056b3;
}
strong {
  color: #2c3e50;
}
</style>
