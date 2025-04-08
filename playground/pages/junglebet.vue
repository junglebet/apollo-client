<script setup lang="ts">
import JunglebetDemo from '~/components/JunglebetDemo.vue'
</script>
<template>
  <div id="wrapper">
    <main class="p-4">
      <ClientOnly>
        <JunglebetDemo />
      </ClientOnly>
    </main>
  </div>
</template>
