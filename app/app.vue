<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// No global script logic is needed here.
// The useWorkouts composable is loaded on individual pages where needed.
// Removing the onMounted hook that caused the aggressive redirect.
</script>
