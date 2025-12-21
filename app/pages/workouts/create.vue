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
          <!-- Exercise Header -->
          <div class="exercise-header">
            <span class="exercise-index">{{ index + 1 }}</span>
            <input 
              v-model="exercise.name" 
              class="exercise-name-input" 
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
          
          <!-- Target Values -->
          <div class="exercise-targets">
            <div class="target-field">
              <label class="label-sm">Series</label>
              <input 
                type="number" 
                inputmode="numeric"
                v-model.number="exercise.targetSets" 
                class="input target-input"
                min="1"
              />
            </div>
            <div class="target-field">
              <label class="label-sm">Reps</label>
              <input 
                type="number" 
                inputmode="numeric"
                v-model.number="exercise.targetReps" 
                class="input target-input"
                min="1"
              />
            </div>
            <div class="target-field">
              <label class="label-sm">Kg</label>
              <input 
                type="number" 
                inputmode="decimal"
                v-model.number="exercise.targetWeight" 
                class="input target-input"
                min="0"
                step="0.5"
              />
            </div>
          </div>
          
          <!-- Notes (Optional) -->
          <div class="exercise-notes">
            <textarea 
              v-model="exercise.notes" 
              class="input notes-input"
              placeholder="Notas opcionales (ej: agarre ancho, pausado...)"
              rows="1"
              @focus="expandNotes($event)"
              @blur="collapseNotes($event)"
            ></textarea>
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
    targetReps: 10,
    targetWeight: 0,
    notes: ''
  })
}

const expandNotes = (event: FocusEvent) => {
  const textarea = event.target as HTMLTextAreaElement
  textarea.rows = 2
}

const collapseNotes = (event: FocusEvent) => {
  const textarea = event.target as HTMLTextAreaElement
  if (!textarea.value.trim()) {
    textarea.rows = 1
  }
}

const removeExercise = (index: number) => {
  exercises.value.splice(index, 1)
}

const saveWorkout = () => {
  if (!name.value.trim()) return alert('Ponle nombre a la rutina')
  if (exercises.value.length === 0) return alert('Añade al menos un ejercicio')
  
  // Validate exercise names
  const hasEmptyNames = exercises.value.some(e => !e.name.trim())
  if (hasEmptyNames) return alert('Todos los ejercicios deben tener nombre')
  
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

.exercise-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.exercise-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--color-primary);
  color: black;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.exercise-name-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 600;
  padding: var(--spacing-sm) 0;
  min-height: var(--touch-target-min);
  outline: none;
  transition: border-color var(--transition-fast);
}

.exercise-name-input:focus {
  border-color: var(--color-primary);
}

.exercise-name-input::placeholder {
  color: var(--color-text-muted);
  font-weight: 400;
}

/* Target Values Grid */
.exercise-targets {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-sm);
}

.target-field {
  display: flex;
  flex-direction: column;
}

.target-input {
  text-align: center;
  padding: var(--spacing-sm);
  font-size: 1.1rem;
  font-weight: 600;
  min-height: var(--touch-target-min);
}

/* Override focus on number inputs to prevent zoom on iOS */
.target-input::-webkit-outer-spin-button,
.target-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.target-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Notes */
.exercise-notes {
  margin-top: var(--spacing-md);
}

.notes-input {
  resize: none;
  font-size: 0.9rem;
  padding: var(--spacing-sm) var(--spacing-md);
  min-height: auto;
  transition: all var(--transition-fast);
}

.notes-input::placeholder {
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
