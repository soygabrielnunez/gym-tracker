<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useWorkouts } from '~/composables/useWorkouts'

const { activeSession } = useWorkouts()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  if (activeSession.value && route.path !== `/session/${activeSession.value.id}`) {
    router.push(`/session/${activeSession.value.id}`)
  }
})
</script>
