<template>
  <section>
    <h2>{{ msg }}</h2>
    <p>Counter: <strong>{{ count }}</strong></p>
    <button @click="count++">Increment</button>
  </section>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ msg: String })
const count = ref(0)
</script>

<style scoped>
button { padding: .4rem .8rem; border-radius: 6px; cursor: pointer; }
</style>
