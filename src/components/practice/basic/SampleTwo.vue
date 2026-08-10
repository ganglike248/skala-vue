<script setup>
// import { ref } from 'vue'
const welcomeMessage = 'Welcome to Skala-Vue'
</script>

<template>
  <div class="practice-section">
    <h1>{{ welcomeMessage }}</h1>
    <p>{{ welcomeMessage.toUpperCase() }}</p>
    <p>{{ 'Random number: ' + Math.ceil(Math.random() * 100) }}</p>
  </div>
</template>
