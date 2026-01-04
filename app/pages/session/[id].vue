<template>
  <div v-if="activeSession" class="session-page">
    <!-- Header -->
    <header class="session-header">
      <div class="header-left">
        <NuxtLink to="/" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Volver
        </NuxtLink>
      </div>
      <div class="header-center">
        <div class="timer-display">{{ formatTime(elapsed) }}</div>
      </div>
      <div class="header-right">
        <!-- Finish button removed from header as requested -->
      </div>
    </header>

    <!-- Content Area (Scrollable) -->
    <div class="session-content">
      
      <!-- EXERCISE VIEW -->
      <div v-if="!isFinishScreen" class="exercise-view">
        <div class="exercise-header-block mb-6">
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

            <!-- Notes Section -->
            <div v-if="currentExercise.notes" class="notes-section mt-4">
               <div class="notes-label">Notas:</div>
               <p class="notes-text">{{ currentExercise.notes }}</p>
            </div>
        </div>

        <!-- Sets List -->
        <div class="sets-container mb-6">
           <div v-if="currentExercise.sets.length === 0" class="empty-sets-state">
              <p>Sin series registradas</p>
           </div>
           <div v-else class="sets-list">
              <div v-for="(set, idx) in currentExercise.sets" :key="idx" class="set-row">
                 <div class="set-idx">#{{ idx + 1 }}</div>
                 <div class="set-details">
                    <span class="set-weight">{{ set.weight }}kg</span>
                    <span class="set-reps">{{ set.reps }} reps</span>
                 </div>
                 <button class="btn-icon danger sm" @click="removeSet(currentExercise, idx)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                 </button>
              </div>
           </div>
        </div>

        <!-- Input Controls area -->
        <div class="controls-area">
           <!-- Reps Control -->
           <div class="control-row mb-4">
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
           <div class="control-row mb-4">
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
       <!-- Integrated Progress Bar -->
       <div class="footer-progress-track">
         <div 
            v-for="(ex, idx) in activeSession.exercises" 
            :key="idx"
            class="progress-segment"
         >
            <div 
               class="progress-fill" 
               :style="{ 
                  width: idx < activeSession.currentExerciseIndex ? '100%' : 
                         idx === activeSession.currentExerciseIndex && !isFinishScreen ? Math.min((ex.sets.length / (ex.targetSets || 3)) * 100, 100) + '%' : '0%' 
               }"
            ></div>
         </div>
       </div>

       <button 
          class="btn-nav" 
          :disabled="isFirstExercise"
          @click="prevExercise"
       >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Anterior
       </button>

       <div class="nav-indicator">
          {{ isFinishScreen ? 'FIN' : `${activeSession.currentExerciseIndex + 1} / ${activeSession.exercises.length}` }}
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
    <ConfirmModal 
      :show="showFinishModal"
      title="¿Terminar entrenamiento?"
      message="¿Seguro que quieres terminar?"
      confirmText="TERMINAR"
      cancelText="CANCELAR"
      confirmType="danger"
      @confirm="confirmFinish"
      @cancel="showFinishModal = false"
    />
    
    <InputModal
      :show="showExerciseModal"
      title="Nuevo Ejercicio"
      placeholder="Nombre del ejercicio"
      @confirm="confirmAddExercise"
      @cancel="showExerciseModal = false"
    />

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { activeSession, finishSession } = useWorkouts()
const showFinishModal = ref(false)
const showExerciseModal = ref(false)
const isFinishScreen = ref(false)

const elapsed = ref(0)
let timerInterval: any = null

/* --- COMPUTED --- */
const currentExercise = computed(() => {
   if (!activeSession.value) return {}
   return activeSession.value.exercises[activeSession.value.currentExerciseIndex] || {}
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

const removeSet = (exercise: any, index: number) => {
  exercise.sets.splice(index, 1)
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

/* --- ACTIONS --- */
const finish = () => {
  showFinishModal.value = true
}

const confirmFinish = () => {
  finishSession()
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
      targetWeight: 0,
      currentWeight: 0,
      currentReps: 10,
      notes: ''
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
  /* Add padding to container so floating elements have spacing from edges */
  padding: var(--spacing-sm);
  gap: var(--spacing-sm);
}

.session-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  /* Transparent header as requested */
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

.timer-display {
    font-variant-numeric: tabular-nums;
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--color-primary);
    /* Remove pill background for cleaner, airier look, or keep it? 
       User asked for "better UI/UX... symmetrical". 
       A centered plain text might look cleaner and more symmetrical with the "Volver" text. 
       Let's try removing the background and making it match the text style but colored. 
       OR keep the pill but perfect center. 
       I'll keep the pill but make it slightly more subtle or standard. 
       Actually, aligning it with "Volver" (text) suggests maybe just text is better? 
       But "Volver" is a button.
       Let's stick to perfect centering first. */
    background-color: var(--color-surface);
    padding: 6px 16px;
    border-radius: 999px;
    border: 1px solid var(--color-border);
}

.session-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; /* Important for flex scroll */
    padding-bottom: 70px; /* Space for footer */
}

/* EXERCISE VIEW: Flex column to manage scroll vs fixed */
.exercise-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.exercise-header-block {
    flex-shrink: 0;
    margin-bottom: var(--spacing-sm);
    padding: 0 var(--spacing-xs);
}

.exercise-title {
    font-size: 1.5rem;
    margin-bottom: 4px;
    line-height: 1.1;
}

.notes-section {
    background-color: var(--color-surface-elevated);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-primary);
    margin-top: var(--spacing-sm);
}

.notes-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 4px;
}

.notes-text {
    font-size: 0.9rem;
    color: var(--color-text);
    margin: 0;
    line-height: 1.4;
    white-space: pre-wrap;
}

/* SETS LIST: Grows and scrolls */
.sets-container {
    flex: 1;
    overflow-y: auto;
    margin-bottom: var(--spacing-sm);
    min-height: 60px; /* Ensure at least some list is visible */
}

.sets-list {
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--color-border);
}

.set-row {
    display: flex;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    min-height: 44px;
}

.set-row:last-child { border-bottom: none; }

.set-idx {
    color: var(--color-text-muted);
    font-weight: 600;
    width: 40px;
}

.set-details {
    flex: 1;
    font-weight: 700;
    display: flex;
    gap: var(--spacing-md);
}

/* CONTROLS: Fixed height, never scrolls away */
.controls-area {
    flex-shrink: 0;
    background-color: var(--color-surface);
    padding: var(--spacing-md);
    border-radius: var(--radius-lg); /* Rounded card */
    border: 1px solid var(--color-border);
}

.control-row {
    margin-bottom: var(--spacing-md);
    padding: 0;
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
    grid-template-columns: 56px 1fr 56px; /* Slightly smaller button to save space */
    gap: var(--spacing-md);
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
    cursor: pointer;
    touch-action: manipulation;
}

.btn-control span {
    margin-top: -4px;
}

.btn-control:active {
    background-color: var(--color-border);
    transform: scale(0.96);
}

.btn-control.primary {
    background-color: var(--color-primary);
    color: black;
    border: none;
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
    font-variant-numeric: tabular-nums;
}

/* Finish Screen */
.finish-view {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.finish-card {
    text-align: center;
    width: 100%;
}

.summary-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
}

.stat-item {
    display: flex;
    flex-direction: column;
}

.stat-val {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-primary);
}

.stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--color-text-muted);
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

.footer-progress-track {
    position: absolute;
    top: -4px; /* Move slightly up to sit on the border or just above content? Let's try sitting ON the top edge */
    left: 0;
    right: 0;
    height: 4px;
    display: flex;
    gap: 2px;
    background-color: var(--color-bg); /* Gap color */
}

.progress-segment {
    flex: 1;
    height: 100%;
    background-color: var(--color-surface-elevated);
    position: relative;
}

.progress-fill {
    height: 100%;
    background-color: var(--color-primary);
    transition: width 0.3s ease;
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

/* Custom Scrollbar for Session Page */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: var(--color-surface); 
}

::-webkit-scrollbar-thumb {
  background: var(--color-border); 
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted); 
}
</style>
