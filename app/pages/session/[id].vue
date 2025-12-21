<template>
  <div v-if="activeSession">
    <div class="header-actions mb-4">
      <h1 style="font-size:1.5rem; margin:0">{{ activeSession.name }}</h1>
      <button class="btn btn-sm" @click="finish" style="width:auto; padding:0.5rem 1rem; background:#ff4444; color:white">
        Terminar
      </button>
    </div>

    <div class="timer mb-4 text-center">
      <span style="font-size:2rem; font-variant-numeric: tabular-nums">
        {{ formatTime(elapsed) }}
      </span>
    </div>

    <div class="exercises-container">
      <div v-for="(exercise, exIndex) in activeSession.exercises" :key="exIndex">
        <!-- Active Exercise (Detailed View) -->
        <div v-if="activeSession.currentExerciseIndex === exIndex" class="card mb-4 exercise-card">
          <h2 class="h3">{{ exercise.name }}</h2>
          
          <!-- Sets Done -->
          <div v-if="exercise.sets.length > 0" class="sets-history mb-4">
            <div v-for="(set, setIndex) in exercise.sets" :key="setIndex" class="set-row">
              <span class="set-num">#{{ setIndex + 1 }}</span>
              <span class="set-data">{{ set.weight > 0 ? `${set.weight}kg x` : '' }} {{ set.reps }} reps</span>
              <div style="display:flex; align-items:center; gap:10px">
                <span class="set-check">✓</span>
                <button 
                  class="btn-icon-small" 
                  @click="removeSet(exercise, setIndex)"
                  style="padding: 4px; border:none; background:none; cursor:pointer; color:#888"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Add Set Form -->
          <div class="add-set-form">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px">
              <div>
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
              <div>
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
            <button 
              class="btn btn-primary" 
              @click="logSet(exercise)"
              style="padding:1.5rem; font-size:1.2rem"
            >
              AÑADIR SERIE
            </button>
          </div>
        </div>

        <!-- Inactive Exercise (Compact View) -->
        <div 
          v-else 
          class="card mb-2 exercise-summary" 
          @click="activeSession.currentExerciseIndex = exIndex"
          style="cursor:pointer; padding: 1rem; opacity: 0.8"
        >
          <div style="display:flex; justify-content:space-between; align-items:center">
             <h3 class="h4 m-0" style="margin:0">{{ exercise.name }}</h3>
             <span style="font-size:0.8rem; color:#888">Tocá para ver</span>
          </div>
        </div>
      </div>

      <!-- Add ad-hoc exercise button -->
       <button class="btn btn-secondary mt-4 mb-8" @click="addAdHocExercise">
        + Añadir Ejercicio Extra
      </button>
    </div>
  </div>
  <div v-else class="text-center" style="padding:2rem">
    <p>Cargando sesión...</p>
    <NuxtLink to="/" class="btn btn-secondary">Volver</NuxtLink>
  </div>

  
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
    // If state is lost or invalid URL, try to recover or redirect
    // For now, redirect if no active session match
    // router.push('/') // Commented out for dev safety
  }

  // Calculate elapsed
  const updateTimer = () => {
    if (activeSession.value) {
      const start = new Date(activeSession.value.startTime).getTime()
      elapsed.value = Math.floor((Date.now() - start) / 1000)
    }
  }
  
  updateTimer()
  timerInterval = setInterval(updateTimer, 1000)

  // Initialize inputs with smart defaults if exercises exist
  if (activeSession.value) {
    if (typeof activeSession.value.currentExerciseIndex === 'undefined') {
       activeSession.value.currentExerciseIndex = 0
    }
    activeSession.value.exercises.forEach((e: any) => {
      if (e.currentWeight === undefined) e.currentWeight = e.targetWeight || 0
      if (e.currentReps === undefined) e.currentReps = e.targetReps || 10
    })
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const logSet = (exercise: any) => {
  if (!exercise.currentReps) return

  exercise.sets.push({
    weight: exercise.currentWeight || 0,
    reps: exercise.currentReps,
    completedAt: new Date().toISOString()
  })
  
  // Keep values for next set (Smart Defaults)
  // Maybe slight auto-increment logic or keep same
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
      currentWeight: 0,
      currentReps: 10
    })
    // Switch focus to new exercise
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
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.timer {
  color: var(--color-primary);
  font-family: monospace;
}
.exercise-card {
  border-left: 4px solid var(--color-primary);
}
.set-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #333;
  color: var(--color-text-dim);
}
.set-check {
  color: var(--color-primary);
}
.input-giant {
  font-size: 1.5rem;
  text-align: center;
  padding: 0.8rem;
}
.label-sm {
  font-size: 0.8rem;
  color: #888;
  display: block;
  text-align: center;
  margin-bottom: 4px;
}
</style>
