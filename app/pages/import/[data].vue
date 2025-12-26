<template>
  <div class="container">
    <div v-if="workout" class="card">
      <h1 class="h2 mb-4">Importar Rutina</h1>
      <p class="mb-2">Estás a punto de importar la siguiente rutina:</p>

      <div class="workout-preview">
        <h3 class="workout-name">{{ workout.name }}</h3>
        <ul class="exercise-list">
          <li v-for="(exercise, index) in workout.exercises" :key="index">
            {{ exercise.name }} ({{ exercise.targetSets }}x{{ exercise.targetReps }})
          </li>
        </ul>
      </div>

      <div class="row-stack-sm mt-6">
        <button class="btn btn-primary" @click="importRoutine">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Confirmar Importación
        </button>
        <button class="btn btn-secondary" @click="cancelImport">Cancelar</button>
      </div>
    </div>
    <div v-else-if="error" class="card">
      <h1 class="h2 mb-4 text-danger">Error</h1>
      <p>{{ error }}</p>
      <button class="btn btn-secondary mt-4" @click="cancelImport">Volver al Inicio</button>
    </div>
    <div v-else class="card">
      <p>Cargando datos de la rutina...</p>
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
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
}
.card {
  width: 100%;
}
.workout-preview {
  background-color: var(--color-background-muted);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.workout-name {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.2rem;
  text-transform: uppercase;
}
.exercise-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  color: var(--color-text-muted);
}
.text-danger {
  color: var(--color-danger);
}
.mt-6 {
  margin-top: 2rem;
}
</style>
