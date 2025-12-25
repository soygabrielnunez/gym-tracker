<template>
  <div v-if="activeSession" class="session-page">
    <!-- Header -->
    <header class="session-header">
      <NuxtLink to="/" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver
      </NuxtLink>
      <button class="btn btn-sm btn-finish" @click="finish">
        Terminar
      </button>
    </header>

    <!-- Session Info & Timer -->
    <div class="session-info mb-6">
      <h1 class="session-title">{{ activeSession.name }}</h1>
      <div class="timer-display">{{ formatTime(elapsed) }}</div>
    </div>

    <!-- Exercises -->
    <div class="exercises-container">
      <div v-for="(exercise, exIndex) in activeSession.exercises" :key="exIndex">
        
        <!-- Active Exercise (Expanded) -->
        <div v-if="activeSession.currentExerciseIndex === exIndex" class="exercise-active card mb-4">
          <div class="exercise-header">
            <h2 class="exercise-name">{{ exercise.name }}</h2>
            <span class="exercise-badge">Activo</span>
          </div>
          
          <!-- Target Info -->
          <div v-if="exercise.targetSets || exercise.targetReps || exercise.targetWeight" class="target-info mb-4">
            <span class="target-label">Objetivo:</span>
            <span class="target-value">
              {{ exercise.targetSets || '?' }} series × 
              {{ exercise.targetReps || '?' }} reps
              <template v-if="exercise.targetWeight > 0"> @ {{ exercise.targetWeight }}kg</template>
            </span>
          </div>
          
          <!-- Notes -->
          <div v-if="exercise.notes" class="exercise-notes mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="notes-icon">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
            <span class="notes-text">{{ exercise.notes }}</span>
          </div>
          
          <!-- Progress Indicator -->
          <div class="progress-bar mb-4" v-if="exercise.targetSets">
            <div 
              class="progress-fill" 
              :style="{ width: Math.min(100, (exercise.sets.length / exercise.targetSets) * 100) + '%' }"
            ></div>
            <span class="progress-text">{{ exercise.sets.length }}/{{ exercise.targetSets }} series</span>
          </div>
          
          <!-- Completed Sets -->
          <div v-if="exercise.sets.length > 0" class="sets-list mb-4">
            <div v-for="(set, setIndex) in exercise.sets" :key="setIndex" class="set-item">
              <div class="set-row">
                <div class="set-info">
                  <span class="set-number">#{{ Number(setIndex) + 1 }}</span>
                  <span class="set-data">
                    {{ set.weight > 0 ? `${set.weight}kg × ` : '' }}{{ set.reps }} reps
                  </span>
                </div>
                <div class="set-actions">
                <span class="set-check">✓</span>
                <button 
                  class="btn-icon danger" 
                  @click="removeSet(exercise, Number(setIndex))"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div v-if="set.comment" class="set-comment">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="comment-icon">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
              </svg>
              <span>{{ set.comment }}</span>
            </div>
            </div>
          </div>

          <!-- Add Set Form -->
          <div class="add-set-form">
            <div class="input-grid mb-4">
              <div class="input-group">
                <label class="label-sm">Kg</label>
                <input 
                  type="number" 
                  inputmode="decimal" 
                  v-model="exercise.currentWeight" 
                  class="input input-giant"
                  placeholder="0"
                  @focus="($event.target as HTMLInputElement).select()"
                />
              </div>
              <div class="input-group">
                <label class="label-sm">Reps</label>
                <input 
                  type="number" 
                  inputmode="numeric" 
                  v-model="exercise.currentReps" 
                  class="input input-giant"
                  placeholder="0"
                  @focus="($event.target as HTMLInputElement).select()"
                />
              </div>
            </div>
            <div class="input-group mb-4">
              <label class="label-sm">Comentario</label>
              <textarea
                v-model="exercise.currentComment"
                class="input"
                placeholder="Añade una nota sobre esta serie..."
                rows="2"
              ></textarea>
            </div>
            <button class="btn btn-primary btn-add-set" @click="logSet(exercise)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Añadir Serie
            </button>
          </div>
        </div>

        <!-- Inactive Exercise (Collapsed) -->
        <div 
          v-else 
          class="exercise-collapsed card card-interactive mb-2"
          @click="activeSession.currentExerciseIndex = exIndex"
        >
          <div class="row-between">
            <div class="collapsed-info">
              <h3 class="collapsed-name">{{ exercise.name }}</h3>
              <span class="collapsed-sets text-muted">
                {{ exercise.sets.length }}<template v-if="exercise.targetSets">/{{ exercise.targetSets }}</template> series
              </span>
            </div>
            <div class="collapsed-right">
              <span v-if="exercise.targetSets && exercise.sets.length >= exercise.targetSets" class="completed-badge">✓</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsed-chevron">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Exercise Button -->
      <button class="btn btn-secondary mt-4" @click="addAdHocExercise">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Añadir Ejercicio
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="loading-state">
    <p class="text-muted">Cargando sesión...</p>
    <NuxtLink to="/" class="btn btn-secondary">Volver al Inicio</NuxtLink>
  </div>

  <!-- Modals -->
  <ConfirmModal 
    :show="showFinishModal"
    title="¿Terminar entrenamiento?"
    message="Se guardará el progreso en el historial."
    @confirm="confirmFinish"
    @cancel="showFinishModal = false"
  />

  <InputModal
    :show="showExerciseModal"
    title="Nuevo Ejercicio"
    placeholder="Ej: Press de Banca"
    @confirm="confirmAddExercise"
    @cancel="showExerciseModal = false"
  />
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { activeSession, finishSession } = useWorkouts()
const showFinishModal = ref(false)

// Timer
const elapsed = ref(0)
let timerInterval: any = null

onMounted(() => {
  if (!activeSession.value || activeSession.value.id !== route.params.id) {
    // Session not found - could redirect
  }

  const updateTimer = () => {
    if (activeSession.value) {
      const start = new Date(activeSession.value.startTime).getTime()
      elapsed.value = Math.floor((Date.now() - start) / 1000)
    }
  }
  
  updateTimer()
  timerInterval = setInterval(updateTimer, 1000)

  // Initialize inputs with smart defaults from targets
  if (activeSession.value) {
    if (typeof activeSession.value.currentExerciseIndex === 'undefined') {
       activeSession.value.currentExerciseIndex = 0
    }
    activeSession.value.exercises.forEach((e: any) => {
      // Use target values as defaults
      if (e.currentWeight === undefined) e.currentWeight = e.targetWeight || 0
      if (e.currentReps === undefined) e.currentReps = e.targetReps || 10
      if (e.currentComment === undefined) e.currentComment = ''
    })
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
}

const logSet = (exercise: any) => {
  if (!exercise.currentReps) return

  exercise.sets.push({
    weight: exercise.currentWeight || 0,
    reps: exercise.currentReps,
    comment: exercise.currentComment || '',
    completedAt: new Date().toISOString()
  })

  // Clear comment for next set
  exercise.currentComment = ''
}

const removeSet = (exercise: any, index: number) => {
  exercise.sets.splice(index, 1)
}

const showExerciseModal = ref(false)

const addAdHocExercise = () => {
  showExerciseModal.value = true
}

const confirmAddExercise = (name: string) => {
  if (name && activeSession.value) {
    activeSession.value.exercises.push({
      name,
      sets: [],
      targetSets: 3,
      targetReps: 10,
      targetWeight: 0,
      currentWeight: 0,
      currentReps: 10,
      currentComment: ''
    })
    activeSession.value.currentExerciseIndex = activeSession.value.exercises.length - 1
  }
  showExerciseModal.value = false
}

const finish = () => {
  showFinishModal.value = true
}

const confirmFinish = () => {
  finishSession()
  router.push('/')
}
</script>

<style scoped>
.session-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* Header */
.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.btn-finish {
  background-color: var(--color-danger);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  min-height: var(--touch-target-min);
  width: auto;
  flex-shrink: 0;
}

.btn-finish:active {
  background-color: #e03d3d;
}

/* Session Info */
.session-info {
  text-align: center;
}

.session-title {
  font-size: 1.25rem;
  color: var(--color-text);
  text-transform: none;
  margin-bottom: var(--spacing-sm);
}

/* Exercises */
.exercises-container {
  flex: 1;
}

/* Active Exercise Card */
.exercise-active {
  border-left: 4px solid var(--color-primary);
  padding: var(--spacing-lg);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.exercise-name {
  margin: 0;
  font-size: 1.25rem;
  text-transform: uppercase;
}

/* Target Info */
.target-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary-dim);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.target-label {
  color: var(--color-text-muted);
}

.target-value {
  color: var(--color-primary);
  font-weight: 600;
}

/* Exercise Notes */
.exercise-notes {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.notes-icon {
  flex-shrink: 0;
}

.notes-text {
  line-height: 1.4;
}

/* Progress Bar */
.progress-bar {
  position: relative;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0;
  visibility: hidden;
}

/* Sets List */
.sets-list {
  border-radius: var(--radius-md);
  background-color: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.set-item {
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-md);
}
.set-item:last-child {
  border-bottom: none;
}

.set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.set-comment {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
  padding-left: 48px; /* Align with set-data */
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  font-style: italic;
}

.comment-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.set-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.set-number {
  color: var(--color-text-muted);
  font-weight: 600;
  min-width: 32px;
}

.set-data {
  color: var(--color-text-secondary);
}

.set-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.set-check {
  color: var(--color-primary);
  font-weight: bold;
}

/* Add Set Form */
.add-set-form {
  margin-top: var(--spacing-lg);
}

.input-group {
  display: flex;
  flex-direction: column;
}

.btn-add-set {
  font-size: 1.1rem;
  padding: var(--spacing-lg);
}

/* Collapsed Exercise */
.exercise-collapsed {
  padding: var(--spacing-md) var(--spacing-lg);
}

.collapsed-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.collapsed-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
}

.collapsed-sets {
  font-size: 0.85rem;
}

.collapsed-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.collapsed-chevron {
  color: var(--color-text-muted);
}

.completed-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--color-primary);
  color: black;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: bold;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  text-align: center;
}
</style>
