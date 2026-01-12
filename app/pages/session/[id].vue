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
            <div v-if="currentExercise.restTime && (currentExercise.restTime.minutes > 0 || currentExercise.restTime.seconds > 0)" class="target-summary text-muted">
                Descanso: {{ formatRestTime(currentExercise.restTime) }}
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

           <button 
              class="btn btn-lg w-full transition-all"
              :class="isLogSetSuccess ? 'btn-success-feedback' : 'btn-primary'"
              @click="logSet(currentExercise)"
           >
              <span v-if="isLogSetSuccess" class="row-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 REGISTRADA
              </span>
              <span v-else>REGISTRAR SERIE</span>
           </button>
        </div>
      </div>

      <!-- FINISH SCREEN -->
      <!-- FINISH SCREEN -->
      <div v-else class="finish-view">
         <div class="finish-content">
             <div class="trophy-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="trophy-icon"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                <div class="shine"></div>
             </div>
             
             <h2 class="finish-title">¡ENTRENAMIENTO<br>COMPLETADO!</h2>
             <p class="finish-subtitle">Gran trabajo hoy</p>

             <div class="summary-grid">
                <div class="p-card">
                   <span class="p-val">{{ activeSession.exercises.length }}</span>
                   <span class="p-label">Ejercicios</span>
                </div>
                <div class="p-card">
                   <span class="p-val">{{ totalSetsComputed }}</span>
                   <span class="p-label">Series</span>
                </div>
                <div class="p-card">
                   <span class="p-val">{{ formatTime(elapsed) }}</span>
                   <span class="p-label">Tiempo</span>
                </div>
             </div>
             
             <button class="btn-save" @click="confirmFinish">
                GUARDAR Y SALIR
             </button>
             <button class="btn-resume" @click="isFinishScreen = false">
                VOLVER AL ENTRENO
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
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
           <span>Anterior</span>
        </button>

       <div class="nav-indicator">
         <button class="btn-list" @click="showListModal = true">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
           <span>LISTA</span>
         </button>
       </div>

       <button 
          class="btn-nav"           @click="nextExercise"
        >
           <svg v-if="!isFinishScreen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
           <span v-if="isLastExercise && !isFinishScreen">TERMINAR</span>
           <span v-else-if="isFinishScreen"></span>
           <span v-else>SIGUIENTE</span>
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
      title="¿Finalizar sesión?"
      message="¿Qué deseas hacer con la sesión actual?"
      @cancel="showFinishModal = false"
    >
      <template #actions>
        <button class="btn btn-secondary" @click="showFinishModal = false">
           CANCELAR
        </button>
        <button class="btn btn-danger" @click="confirmCancel">
           DESCARTAR
        </button>
        <button class="btn btn-primary" @click="confirmFinish">
           TERMINAR
        </button>
      </template>
    </ConfirmModal>
    
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
const isLogSetSuccess = ref(false)

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

const formatRestTime = (restTime: { minutes: number, seconds: number }) => {
  if (!restTime) return ''
  const { minutes, seconds } = restTime
  let result = ''
  if (minutes > 0) result += `${minutes}m `
  if (seconds > 0) result += `${seconds}s`
  return result.trim()
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

  // Visual feedback
  isLogSetSuccess.value = true
  setTimeout(() => {
    isLogSetSuccess.value = false
  }, 1000)
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
  touch-action: manipulation; /* Disable double-tap zoom */
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
    z-index: 50; /* Above everything */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    animation: fadeIn 0.4s ease-out;
}

.finish-content {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.trophy-container {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.2) 0%, transparent 70%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-lg);
    animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.trophy-icon {
    color: var(--color-primary);
    width: 64px;
    height: 64px;
    filter: drop-shadow(0 0 10px rgba(var(--color-primary-rgb), 0.5));
}

.finish-title {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.1;
    margin: 0;
    margin-bottom: var(--spacing-xs);
    background: linear-gradient(to right, #fff, #ccc);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-transform: uppercase;
    letter-spacing: -0.02em;
}

.finish-subtitle {
    color: var(--color-text-muted);
    font-size: 1rem;
    margin-bottom: var(--spacing-xl);
}

.summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--spacing-sm);
    width: 100%;
    margin-bottom: var(--spacing-xl);
}

.p-card {
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md) var(--spacing-xs);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.p-val {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-text);
    line-height: 1;
    margin-bottom: 4px;
}

.p-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.btn-save {
    width: 100%;
    background-color: var(--color-primary);
    color: black;
    border: none;
    padding: 16px;
    border-radius: var(--radius-lg);
    font-weight: 800;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--spacing-md);
    cursor: pointer;
    transition: transform 0.2s;
}

.btn-save:active {
    transform: scale(0.98);
}

.btn-resume {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    font-weight: 600;
    padding: 8px;
    text-decoration: underline;
    text-decoration-color: var(--color-border);
    text-underline-offset: 4px;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
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
    gap: 4px;
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-weight: 700;
    font-size: 0.7rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    min-width: 60px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    height: 100%;
}

.btn-nav svg {
    color: var(--color-text);
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

.btn-success-feedback {
    background-color: var(--color-primary);
    color: black;
    font-weight: 800;
    transform: scale(1.04);
    z-index: 10;
    box-shadow: 0 0 20px rgba(204, 255, 0, 0.4);
}

.row-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.transition-all {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>