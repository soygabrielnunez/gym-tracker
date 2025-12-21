<template>
  <div v-if="session">
    <!-- Header -->
    <header class="page-header mb-6">
      <NuxtLink to="/" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver
      </NuxtLink>
    </header>

    <!-- Session Info -->
    <div class="session-summary mb-6">
      <h1 class="session-name">{{ session.name }}</h1>
      <p class="session-meta text-muted">
        {{ formatDate(session.endTime) }}
      </p>
      <div class="session-stats">
        <span class="stat">
          <strong>{{ calculateDuration(session.startTime, session.endTime) }}</strong>
          duración
        </span>
        <span class="stat-divider">•</span>
        <span class="stat">
          <strong>{{ session.exercises.length }}</strong>
          ejercicios
        </span>
        <span class="stat-divider">•</span>
        <span class="stat">
          <strong>{{ totalSets }}</strong>
          series
        </span>
      </div>
    </div>

    <!-- Exercises -->
    <div class="exercises-list">
      <div v-for="(exercise, index) in session.exercises" :key="index" class="card exercise-card mb-4">
        <h3 class="exercise-name">{{ exercise.name }}</h3>
        
        <div v-if="exercise.sets && exercise.sets.length > 0" class="sets-list">
          <div v-for="(set, sIndex) in exercise.sets" :key="sIndex" class="set-row">
            <span class="set-number">#{{ Number(sIndex) + 1 }}</span>
            <span class="set-data">
              {{ set.weight > 0 ? `${set.weight}kg × ` : '' }}{{ set.reps }} reps
            </span>
            <span class="set-check">✓</span>
          </div>
        </div>
        <div v-else class="empty-sets text-muted">
          Sin series registradas
        </div>
      </div>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else class="not-found">
    <p class="text-muted mb-4">Sesión no encontrada</p>
    <NuxtLink to="/" class="btn btn-primary">Volver al Inicio</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { history } = useWorkouts()

const session = computed(() => {
  return history.value.find((s: any) => s.id === route.params.id)
})

const totalSets = computed(() => {
  if (!session.value) return 0
  return session.value.exercises.reduce((acc: number, ex: any) => acc + (ex.sets?.length || 0), 0)
})

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return ''
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  return `${minutes}m`
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
}

/* Session Summary */
.session-summary {
  text-align: center;
}

.session-name {
  font-size: 1.5rem;
  color: var(--color-text);
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
}

.session-meta {
  font-size: 0.9rem;
  margin-bottom: var(--spacing-md);
  text-transform: capitalize;
}

.session-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.stat strong {
  color: var(--color-primary);
  font-weight: 700;
}

.stat-divider {
  color: var(--color-text-muted);
}

/* Exercise Cards */
.exercise-card {
  padding: var(--spacing-lg);
}

.exercise-name {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* Sets */
.sets-list {
  border-radius: var(--radius-md);
  background-color: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.set-row {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.set-row:last-child {
  border-bottom: none;
}

.set-number {
  color: var(--color-text-muted);
  font-weight: 600;
  min-width: 40px;
}

.set-data {
  flex: 1;
  color: var(--color-text-secondary);
}

.set-check {
  color: var(--color-primary);
  font-weight: bold;
}

.empty-sets {
  font-size: 0.9rem;
  padding: var(--spacing-md);
  text-align: center;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-md);
}

/* Not Found */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}
</style>
