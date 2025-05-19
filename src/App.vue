<template>
  <div class="container">
    <h1>Vue3 Knob 元件展示</h1>
    <KnobDemo />
  </div>
</template>

<script setup>
import KnobDemo from './components/KnobDemo.vue';
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style> 