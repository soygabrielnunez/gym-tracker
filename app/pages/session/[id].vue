<template>
  <div v-if="activeSession" class="session-page">
    <!-- Header -->
    <header class="session-header">
      <div class="header-left">
        <NuxtLink to="/" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          VOLVER
        </NuxtLink>
      </div>
      <div class="header-center">
         <div class="header-timer">
           {{ formatTime(elapsed) }}
         </div>
      </div>
      <div class="header-right">
        <button class="btn-finish" @click="finish">TERMINAR</button>
      </div>
    </header>

    <!-- Content Area (Scrollable) -->
    <div class="session-content">
      
      <!-- EXERCISE VIEW -->
      <div v-if="!isFinishScreen" class="exercise-view">
        <div class="exercise-header-block">
           <div class="pagination-dots mb-2">
             <span 
                v-for="(ex, idx) in activeSession.exercises" 
                :key="idx"
                class="dot"
                :class="{ active: idx === activeSession.currentExerciseIndex, completed: isExerciseComplete(ex) }"
             ></span>
             <span class="dot finish-dot" :class="{ active: isFinishScreen }"></span>
           </div>
           
           <h1 class="exercise-title">{{ currentExercise.name }}</h1>
           <div class="target-summary text-muted">
              Objetivo: {{ currentExercise.targetSets || 3 }} series × {{ currentExercise.targetReps || 10 }} reps
           </div>

            <!-- Sets Progress Bar -->
            <div class="sets-progress-bar mt-2">
               <div 
                  class="sets-progress-fill" 
                  :style="{ width: Math.min((currentExercise.sets.length / (currentExercise.targetSets || 3)) * 100, 100) + '%' }"
               ></div>
            </div>

            <!-- Quick Actions Bar -->
            <div class="quick-actions-bar">
                <button class="btn-action" @click="showNotesModal = true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <span>Notas</span>
                </button>
                <button class="btn-action" @click="showSetsModal = true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span>{{ currentExercise.sets.length }} Series</span>
                </button>
            </div>
        </div>

        <!-- Input Controls area -->
        <div class="controls-area">
           <!-- Reps Control -->
           <div class="control-row">
              <label class="control-label">REPS</label>
              <div class="control-group">
                 <button class="btn-control" @click="adjustReps(-1)">
                    <span>-</span>
                 </button>
                 <input 
                    type="number" 
                    inputmode="numeric" 
                    v-model="currentExercise.currentReps"
                    class="input-control"
                    @focus="($event.target as HTMLInputElement).select()"
                 />
                 <button class="btn-control" @click="adjustReps(1)">
                    <span>+</span>
                 </button>
              </div>
           </div>

           <!-- Weight Control -->
           <div class="control-row">
              <label class="control-label">KG</label>
              <div class="control-group">
                 <button class="btn-control" @click="adjustWeight(-2.5)">
                    <span>-</span>
                 </button>
                 <input 
                    type="number" 
                    inputmode="decimal" 
                    v-model="currentExercise.currentWeight"
                    class="input-control"
                    @focus="($event.target as HTMLInputElement).select()"
                 />
                 <button class="btn-control" @click="adjustWeight(2.5)">
                    <span>+</span>
                 </button>
              </div>
           </div>

           <button class="btn btn-primary btn-lg w-full" @click="logSet(currentExercise)">
              REGISTRAR SERIE
           </button>
        </div>
      </div>

      <!-- FINISH SCREEN -->
      <div v-else class="finish-view">
         <div class="finish-card">
            <h2>¡Sesión Completada!</h2>
            <div class="summary-stats mb-6">
               <div class="stat-item">
                  <span class="stat-val">{{ activeSession.exercises.length }}</span>
                  <span class="stat-label">Ejercicios</span>
               </div>
               <div class="stat-item">
                  <span class="stat-val">{{ totalSetsComputed }}</span>
                  <span class="stat-label">Series</span>
               </div>
               <div class="stat-item">
                  <span class="stat-val">{{ formatTime(elapsed) }}</span>
                  <span class="stat-label">Tiempo</span>
               </div>
            </div>
            
            <button class="btn btn-primary btn-lg w-full mb-4" @click="confirmFinish">
               GUARDAR ENTRENAMIENTO
            </button>
            <button class="btn btn-secondary w-full" @click="isFinishScreen = false">
               VOLVER
            </button>
         </div>
      </div>

    </div>

    <!-- Sticky Navigation Footer -->
    <div class="session-footer">
       <!-- Progress Bar Removed -->

       <button 
          class="btn-nav" 
          :disabled="isFirstExercise"
          @click="prevExercise"
       >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6-6-6"/></svg>
          Anterior
       </button>

       <div class="nav-indicator">
         <button class="btn-list" @click="showListModal = true">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
           <span>LISTA</span>
         </button>
       </div>

       <button 
          class="btn-nav" 
          @click="nextExercise"
       >
          <span v-if="isLastExercise && !isFinishScreen">TERMINAR</span>
          <span v-else-if="isFinishScreen"></span>
          <span v-else>SIGUIENTE</span>
          <svg v-if="!isFinishScreen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
       </button>
    </div>

    <!-- Modals -->
    <NotesModal
      :show="showNotesModal"
      :base-notes="currentExercise.notes"
      v-model="currentExercise.sessionNotes"
      @close="showNotesModal = false"
    />
    <SetsModal
      :show="showSetsModal"
      :sets="currentExercise.sets"
      @close="showSetsModal = false"
      @remove-set="removeSet"
    />
    <ConfirmModal
      :show="showFinishModal"
      title="¿Descartar entrenamiento?"
      message="Se perderá todo el progreso de esta sesión. Esta acción no se puede deshacer."
      confirmText="DESCARTAR"
      cancelText="CANCELAR"
      confirmType="danger"
      @confirm="confirmCancel"
      @cancel="showFinishModal = false"
    />
    
    <InputModal
      :show="showExerciseModal"
      title="Nuevo Ejercicio"
      placeholder="Nombre del ejercicio"
      @confirm="confirmAddExercise"
      @cancel="showExerciseModal = false"
    />
    
    <ExerciseListModal
      :show="showListModal"
      :exercises="activeSession.exercises"
      :current-index="activeSession.currentExerciseIndex"
      @close="showListModal = false"
      @select-exercise="selectExercise"
    />

  </div>
</template>

<script setup lang="ts">
import NotesModal from '~/components/NotesModal.vue'
import SetsModal from '~/components/SetsModal.vue'
import ExerciseListModal from '~/components/ExerciseListModal.vue'

const route = useRoute()
const router = useRouter()
const { activeSession, finishSession, cancelSession } = useWorkouts()
const showFinishModal = ref(false)
const showExerciseModal = ref(false)
const isFinishScreen = ref(false)
const showNotesModal = ref(false)
const showSetsModal = ref(false)
const showListModal = ref(false)

const elapsed = ref(0)
let timerInterval: any = null

/* --- COMPUTED --- */
const currentExercise = computed(() => {
   if (!activeSession.value) return {}
   const exercise = activeSession.value.exercises[activeSession.value.currentExerciseIndex] || {}
   if (!exercise.sessionNotes) {
     exercise.sessionNotes = ''
   }
   return exercise
})

const isFirstExercise = computed(() => activeSession.value?.currentExerciseIndex === 0 && !isFinishScreen.value)
const isLastExercise = computed(() => activeSession.value?.currentExerciseIndex === activeSession.value.exercises.length - 1)
const totalSetsComputed = computed(() => {
   if (!activeSession.value) return 0
   return activeSession.value.exercises.reduce((acc: number, ex: any) => acc + ex.sets.length, 0)
})

/* --- LIFECYCLE --- */
onMounted(() => {
  if (!activeSession.value) return 

  // Initialize timer
  const updateTimer = () => {
    if (activeSession.value) {
      const start = new Date(activeSession.value.startTime).getTime()
      elapsed.value = Math.floor((Date.now() - start) / 1000)
    }
  }
  updateTimer()
  timerInterval = setInterval(updateTimer, 1000)

  // Init defaults
  initCurrentExerciseDefaults()
})

watch(() => activeSession.value?.currentExerciseIndex, () => {
   initCurrentExerciseDefaults()
})

const initCurrentExerciseDefaults = () => {
    if (!currentExercise.value) return
    if (currentExercise.value.currentWeight === undefined) currentExercise.value.currentWeight = currentExercise.value.targetWeight || 0
    if (currentExercise.value.currentReps === undefined) currentExercise.value.currentReps = currentExercise.value.targetReps || 10
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

/* --- METHODS --- */
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
}

const adjustReps = (delta: number) => {
   const val = Number(currentExercise.value.currentReps || 0) + delta
   currentExercise.value.currentReps = Math.max(0, val)
}

const adjustWeight = (delta: number) => {
   const val = Number(currentExercise.value.currentWeight || 0) + delta
   currentExercise.value.currentWeight = Math.max(0, val)
}

const logSet = (exercise: any) => {
  if (!exercise.currentReps) return

  exercise.sets.push({
    weight: exercise.currentWeight || 0,
    reps: exercise.currentReps,
    completedAt: new Date().toISOString()
  })
}

const removeSet = (index: number) => {
  currentExercise.value.sets.splice(index, 1)
}

const isExerciseComplete = (ex: any) => {
    return ex.sets && ex.sets.length >= (ex.targetSets || 3)
}

/* --- NAVIGATION --- */
const nextExercise = () => {
    if (isFinishScreen.value) return

    if (isLastExercise.value) {
        isFinishScreen.value = true
    } else {
        activeSession.value.currentExerciseIndex++
    }
}

const prevExercise = () => {
    if (isFinishScreen.value) {
        isFinishScreen.value = false
        activeSession.value.currentExerciseIndex = activeSession.value.exercises.length - 1
    } else {
        if (activeSession.value.currentExerciseIndex > 0) {
            activeSession.value.currentExerciseIndex--
        }
    }
}

const selectExercise = (index: number) => {
    activeSession.value.currentExerciseIndex = index
    isFinishScreen.value = false
    showListModal.value = false
}

/* --- ACTIONS --- */
const finish = () => {
  showFinishModal.value = true
}

const confirmFinish = () => {
  finishSession()
  router.push('/')
}

const confirmCancel = () => {
  cancelSession()
  router.push('/')
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
      notes: '',
      sessionNotes: ''
    })
    // Jump to the new exercise
    activeSession.value.currentExerciseIndex = activeSession.value.exercises.length - 1
    isFinishScreen.value = false
  }
  showExerciseModal.value = false
}

</script>

<style scoped>
.session-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background-color: black;
  padding: var(--spacing-sm);
  gap: var(--spacing-sm);
  overflow: hidden;
  overscroll-behavior: none;
  position: fixed; /* Ensures it stays fixed to viewport */
  top: 0;
  left: 0;
  width: 100%;
}

.session-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
}

.header-left, .header-right {
    flex: 1;
    display: flex;
    align-items: center;
}

.header-right {
    justify-content: flex-end;
}

.header-center {
    display: flex;
    justify-content: center;
    flex: 2; /* Give more space to center if needed */
}

.header-timer {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--color-text);
    letter-spacing: 0.5px;
}

.btn-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 0.7rem;
  padding: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-list svg {
  color: var(--color-text);
}

.btn-back {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text);
  font-weight: 600;
  text-decoration: none;
}

.btn-finish {
  background-color: var(--color-danger);
  color: white;
  padding: 6px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.session-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding-bottom: 120px; /* Space for footer */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.exercise-view {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.exercise-header-block {
    flex-shrink: 0;
    padding: 0 var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
}

.exercise-title {
    font-size: 1.5rem;
    margin-bottom: 4px;
    line-height: 1.1;
}

.quick-actions-bar {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
}

.btn-action {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    font-weight: 600;
}

.btn-action svg {
    color: var(--color-text-muted);
}

.controls-area {
    flex-shrink: 0;
    background-color: var(--color-surface);
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
}

.control-row {
    margin-bottom: var(--spacing-sm);
}
.control-row:last-of-type {
    margin-bottom: var(--spacing-md);
}

.control-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 0.1em;
    margin-bottom: 8px;
    display: block;
}

.control-group {
    display: grid;
    grid-template-columns: 56px 1fr 56px;
    gap: var(--spacing-sm);
    align-items: center;
}

.btn-control {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    color: white;
    font-size: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.input-control {
    width: 100%;
    height: 56px;
    background: transparent;
    border: none;
    text-align: center;
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    padding: 0;
}

/* Finish Screen */
.finish-view {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Footer */
.session-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--color-surface);
    border-top: 1px solid var(--color-border);
    padding: var(--spacing-sm) var(--spacing-md);
    padding-bottom: calc(var(--spacing-sm) + var(--safe-area-bottom));
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
}


.btn-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--color-text);
    padding: var(--spacing-xs) var(--spacing-md);
    min-width: 60px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.btn-nav:disabled {
    opacity: 0.3;
}

.nav-indicator {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: var(--color-text-muted);
    font-size: 0.9rem;
}
</style>