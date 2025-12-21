<template>
  <div v-if="session">
    <div class="mb-6">
      <NuxtLink to="/" class="btn btn-secondary mb-4" style="width:auto; display:inline-block">
        ← Volver
      </NuxtLink>
      <h1 class="h2">{{ session.name }}</h1>
      <p class="text-muted">
        {{ formatDate(session.endTime) }} • {{ calculateDuration(session.startTime, session.endTime) }}
      </p>
    </div>

    <div class="exercises-list">
      <div v-for="(exercise, index) in session.exercises" :key="index" class="card mb-4">
        <h3 class="h4 mb-3">{{ exercise.name }}</h3>
        
        <div v-if="exercise.sets && exercise.sets.length > 0">
          <div v-for="(set, sIndex) in exercise.sets" :key="sIndex" class="set-row">
            <span class="set-num">#{{ Number(sIndex) + 1 }}</span>
            <span class="set-data">
              {{ set.weight > 0 ? `${set.weight}kg x` : '' }} {{ set.reps }} reps
            </span>
          </div>
        </div>
        <div v-else class="text-muted">
          Sin series registradas
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-8">
    <p>Sesión no encontrada</p>
    <NuxtLink to="/" class="btn btn-primary mt-4">Volver al Inicio</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { history } = useWorkouts()

const session = computed(() => {
  return history.value.find((s: any) => s.id === route.params.id)
})

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return ''
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(diff / 60000)
  return `${minutes} min`
}
</script>

<style scoped>
.set-row {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem;
  border-bottom: 1px solid #333;
  color: #ccc;
}
.set-row:last-child {
  border-bottom: none;
}
.set-num {
  color: #666;
  width: 40px;
}
</style>
