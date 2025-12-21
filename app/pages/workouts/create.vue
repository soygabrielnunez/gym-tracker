<template>
  <div class="create-page">
    <!-- Header -->
    <header class="page-header mb-6">
      <NuxtLink to="/" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver
      </NuxtLink>
    </header>

    <h1 class="mb-6">Nueva Rutina</h1>
    
    <!-- Routine Name -->
    <div class="card mb-6">
      <label class="label">Nombre de la Rutina</label>
      <input 
        v-model="name" 
        class="input" 
        placeholder="Ej: Pierna Hipertrofia" 
        autofocus
      />
    </div>

    <!-- Exercises -->
    <section class="exercises-section mb-8">
      <div class="section-header">
        <h2 class="h3">Ejercicios</h2>
        <span class="exercise-badge" v-if="exercises.length > 0">{{ exercises.length }}</span>
      </div>

      <div v-if="exercises.length === 0" class="empty-state mb-4">
        <p>Añade ejercicios a tu rutina</p>
      </div>

      <div v-else class="row-stack mb-4">
        <div v-for="(exercise, index) in exercises" :key="index" class="exercise-item card">
          <div class="exercise-row">
            <span class="exercise-index">{{ index + 1 }}.</span>
            <input 
              v-model="exercise.name" 
              class="exercise-input" 
              placeholder="Nombre del ejercicio"
            />
            <button 
              class="btn-icon danger" 
              @click="removeExercise(index)"
              title="Eliminar ejercicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <button class="btn btn-secondary" @click="addExercise">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Añadir Ejercicio
      </button>
    </section>

    <!-- Sticky Save Button -->
    <div class="sticky-bottom">
      <button class="btn btn-primary" @click="saveWorkout">
        Guardar Rutina
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { createWorkout } = useWorkouts()
const router = useRouter()

const name = ref('')
const exercises = ref<any[]>([])

const addExercise = () => {
  exercises.value.push({
    name: '',
    targetSets: 3,
    targetReps: 10
  })
}

const removeExercise = (index: number) => {
  exercises.value.splice(index, 1)
}

const saveWorkout = () => {
  if (!name.value.trim()) return alert('Ponle nombre a la rutina')
  if (exercises.value.length === 0) return alert('Añade al menos un ejercicio')
  
  createWorkout(name.value, exercises.value)
  router.push('/')
}
</script>

<style scoped>
.create-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
}

.exercises-section {
  flex: 1;
}

/* Exercise Items */
.exercise-item {
  padding: var(--spacing-md);
}

.exercise-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.exercise-index {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 24px;
}

.exercise-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text);
  font-size: 1rem;
  padding: var(--spacing-sm) 0;
  min-height: var(--touch-target-min);
  outline: none;
  transition: border-color var(--transition-fast);
}

.exercise-input:focus {
  border-color: var(--color-primary);
}

.exercise-input::placeholder {
  color: var(--color-text-muted);
}
</style>
