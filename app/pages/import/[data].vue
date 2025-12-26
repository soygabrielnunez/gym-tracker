<template>
  <div class="import-page">
    <div v-if="workout" class="import-dialog">
      <h1 class="h2 dialog-title">Importar Rutina</h1>
      <p class="dialog-intro">Estás a punto de importar la siguiente rutina:</p>

      <div class="workout-preview">
        <h2 class="workout-name">{{ workout.name }}</h2>
        <ul class="exercise-list">
          <li v-for="(exercise, index) in workout.exercises" :key="index">
            {{ exercise.name }} ({{ exercise.targetSets }}x{{ exercise.targetReps }})
          </li>
        </ul>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" @click="cancelImport">Cancelar</button>
        <button class="btn btn-primary" @click="importRoutine">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Confirmar
        </button>
      </div>
    </div>
    <div v-else-if="error" class="import-dialog error-dialog">
      <h1 class="h2 text-danger dialog-title">Error</h1>
      <p class="dialog-intro">{{ error }}</p>
      <div class="actions">
        <button class="btn btn-secondary" @click="cancelImport">Volver al Inicio</button>
      </div>
    </div>
    <div v-else class="import-dialog">
      <p class="dialog-intro">Cargando datos de la rutina...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { importWorkoutFromData } = useWorkouts()

const workout = ref<any>(null)
const error = ref<string | null>(null)

onMounted(() => {
  const encodedData = route.params.data as string
  if (!encodedData) {
    error.value = 'No se proporcionaron datos para importar.'
    return
  }

  try {
    const jsonString = atob(encodedData)
    const data = JSON.parse(jsonString)

    if (data.type !== 'gym-tracker-routine' || !data.name || !data.exercises) {
      throw new Error('Los datos de la rutina no son válidos o están corruptos.')
    }

    workout.value = {
      name: data.name,
      exercises: data.exercises
    }
  } catch (e) {
    error.value = 'No se pudieron leer los datos de la rutina. El enlace podría estar dañado.'
    console.error(e)
  }
})

const importRoutine = () => {
  if (workout.value) {
    importWorkoutFromData(workout.value)
    alert(`¡Rutina "${workout.value.name}" importada con éxito!`)
    router.push('/')
  }
}

const cancelImport = () => {
  router.push('/')
}
</script>

<style scoped>
.import-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--safe-area-bottom));
}

.import-dialog {
  background: var(--color-surface-elevated);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s var(--transition-slow);
}

.dialog-title {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.dialog-intro {
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.workout-preview {
  background-color: var(--color-surface);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.workout-name {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  color: var(--color-primary);
}

.exercise-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  color: var(--color-text-muted);
  text-align: center;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.error-dialog {
  text-align: center;
}

.text-danger {
  color: var(--color-danger);
}

/* Add a media query for better desktop layout */
@media (min-width: 768px) {
  .actions {
    flex-direction: row;
  }
}
</style>
