<script setup lang="ts">
import PackingList from './components/PackingList.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-3xl mx-auto">
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">行李清單</h1>
      </header>
      
      <main>
        <PackingList />
      </main>
    </div>
  </div>
</template>
