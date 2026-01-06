<template>
  <div>
    <!-- Hero Section -->
    <section ref="heroSection" class="hero-section mb-8">
      <h1 class="mb-8 pl-2">Tu Gym <span class="text-white">Tracker</span></h1>
      
      <div class="card">
        <button v-if="activeSession" class="btn btn-primary btn-hero mb-4" @click="resumeWorkout">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          Resumir Entreno
        </button>

        <NuxtLink to="/workouts/create" class="btn btn-secondary">
          Crear Nueva Rutina
        </NuxtLink>
      </div>
    </section>

    <!-- Routines Section -->
    <section class="mb-8">
      <div class="section-header">
        <h2 class="h3">Mis Rutinas</h2>
        <div class="header-actions">
          <span class="exercise-badge" v-if="workouts.length > 0">{{ workouts.length }}</span>
        </div>
      </div>
      
      <div v-if="workouts.length === 0" class="empty-state">
        <p>No hay rutinas guardadas.</p>
        <p class="text-muted" style="font-size: 0.875rem; margin: 0">Crea una rutina o importa un archivo</p>
      </div>
      
      <div v-else class="row-stack">
        <div 
          v-for="workout in workouts" 
          :key="workout.id" 
          class="card card-interactive workout-card"
          @click="startWorkout(workout.id)"
        >
          <div class="row-between">
            <div class="workout-info">
              <h3 class="workout-name">{{ workout.name }}</h3>
              <p class="workout-meta text-muted">
                {{ workout.exercises.length }} ejercicios • {{ getTotalSets(workout) }} series
              </p>
            </div>
            <div class="workout-actions">
              <!-- More Options Menu Button -->
              <button
                class="btn-icon"
                @click.stop="openWorkoutOptions(workout)"
                title="Más opciones"
                aria-label="Más opciones"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- History Section -->
    <section>
      <div class="section-header">
        <NuxtLink to="/history" class="row-between text-decoration-none" style="text-decoration: none; color: inherit; width: 100%;">
            <div class="row" style="gap: 0.5rem;">
                <h2 class="h3">Historial Reciente</h2>
                <span class="exercise-badge" v-if="history.length > 0">{{ history.length }}</span>
            </div>
            <div class="text-primary text-sm font-bold uppercase">Ver todo</div>
        </NuxtLink>
      </div>
      
      <div v-if="history.length === 0" class="empty-state">
        <p>No hay entrenamientos completados.</p>
        <p class="text-muted" style="font-size: 0.875rem; margin: 0">Tu progreso aparecerá aquí</p>
      </div>
      
      <div v-else class="row-stack">
        <div 
          v-for="session in history" 
          :key="session.id" 
          class="card card-interactive history-card"
          @click="goToHistoryDetail(session.id)"
        >
          <div class="row-between">
            <div class="history-info">
              <h3 class="history-name">{{ session.name }}</h3>
              <p class="history-meta text-muted">
                {{ formatHistoryDate(session.endTime) }} • {{ calculateDuration(session.startTime, session.endTime) }} • {{ session.exercises.length }} ejercicios
              </p>
            </div>
            <button 
              class="btn-icon danger" 
              @click.stop="confirmDelete(session.id)"
              title="Eliminar del historial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <ConfirmModal 
    :show="showDeleteModal"
    :title="modalTitle"
    :message="modalMessage"
    @confirm="handleDelete"
    @cancel="closeDeleteModal"
  />

  <ConfirmModal
    :show="showOverwriteModal"
    title="¿Iniciar un nuevo entreno?"
    message="Tienes un entrenamiento activo. Si continúas, se perderá el progreso actual. ¿Estás seguro?"
    @confirm="handleOverwriteConfirm"
    @cancel="showOverwriteModal = false"
  />

  <!-- Start Workout Bottom Sheet -->
  <BottomSheet
    :show="showStartWorkoutSheet"
    @update:show="showStartWorkoutSheet = $event"
  >
    <div class="sheet-content">
      <h3 class="mb-4 text-center">Iniciar Entrenamiento</h3>
      
      <div v-if="workouts.length > 0">
        <div class="divider mb-4">
            <span class="divider-text">O mis rutinas</span>
        </div>
        
        <div class="row-stack">
            <div 
              v-for="workout in workouts" 
              :key="workout.id" 
              class="card card-interactive p-3"
              @click="startSheetWorkout(workout.id)"
            >
                <div class="row-between">
                    <span class="font-bold">{{ workout.name }}</span>
                    <span class="text-muted text-sm">{{ workout.exercises.length }} ejercicios</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  </BottomSheet>

  <!-- Options Bottom Sheet -->
  <BottomSheet 
    :show="!!selectedWorkout" 
    @update:show="val => !val && (selectedWorkout = null)"
  >
    <div v-if="selectedWorkout">
        <h3 class="mb-4 text-center">{{ selectedWorkout.name }}</h3>
        <div class="row-stack">
            <button class="btn btn-secondary w-full" @click="handleShare(selectedWorkout.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Compartir
            </button>
            <button class="btn btn-secondary w-full" @click="handleEdit(selectedWorkout.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
            </button>
            <button class="btn btn-danger w-full" @click="handleDeleteWorkoutRequest(selectedWorkout.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                Eliminar
            </button>
        </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('es')
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(relativeTime)

const { workouts, activeSession, startSession, shareWorkout, history, deleteSession, deleteWorkout } = useWorkouts()
const router = useRouter()

// --- FAB Logic ---
const showStartWorkoutSheet = ref(false)

const startSheetWorkout = (workoutId: string) => {
    showStartWorkoutSheet.value = false
    startWorkout(workoutId)
}

// --- Navigation & Actions ---

const resumeWorkout = () => {
  if (activeSession.value) {
    router.push(`/session/${activeSession.value.id}`)
  }
}

// Overwrite confirmation logic
const showOverwriteModal = ref(false)
const nextWorkoutId = ref<string | null>(null)

const startWorkout = (workoutId: string) => {
  if (activeSession.value) {
    nextWorkoutId.value = workoutId
    showOverwriteModal.value = true
  } else {
    const sessionId = startSession(workoutId)
    router.push(`/session/${sessionId}`)
  }
}

const handleOverwriteConfirm = () => {
  const workoutId = nextWorkoutId.value ?? undefined
  const sessionId = startSession(workoutId)
  router.push(`/session/${sessionId}`)
  showOverwriteModal.value = false
}

const editWorkout = (workoutId: string) => {
  router.push(`/workouts/${workoutId}`)
}

const getTotalSets = (workout: any) => {
  return workout.exercises.reduce((acc: number, ex: any) => acc + (ex.targetSets || 3), 0)
}

// --- Deletion Logic ---
const showDeleteModal = ref(false)
const sessionToDelete = ref<string | null>(null)
const workoutToDelete = ref<string | null>(null) // Used for logic
const deleteType = ref<'history' | 'workout'>('history')
const modalTitle = ref('')
const modalMessage = ref('')

// --- Bottom Sheet Logic ---
const selectedWorkout = ref<any>(null)

const openWorkoutOptions = (workout: any) => {
    selectedWorkout.value = workout
}

const handleShare = (id: string) => {
    shareWorkout(id)
    selectedWorkout.value = null
}

const handleEdit = (id: string) => {
    editWorkout(id)
    selectedWorkout.value = null
}

const handleDeleteWorkoutRequest = (id: string) => {
    workoutToDelete.value = id
    deleteType.value = 'workout'
    modalTitle.value = '¿Eliminar rutina?'
    modalMessage.value = 'Se eliminará la rutina y sus ejercicios configurados.'
    showDeleteModal.value = true
    selectedWorkout.value = null // Close sheet
}


const confirmDelete = (sessionId: string) => {
  sessionToDelete.value = sessionId
  deleteType.value = 'history'
  modalTitle.value = '¿Eliminar historial?'
  modalMessage.value = 'Se eliminará este registro de entrenamiento.'
  showDeleteModal.value = true
}

const handleDelete = () => {
  if (deleteType.value === 'history' && sessionToDelete.value) {
    deleteSession(sessionToDelete.value)
  } else if (deleteType.value === 'workout' && workoutToDelete.value) {
    deleteWorkout(workoutToDelete.value)
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  sessionToDelete.value = null
  workoutToDelete.value = null
}

const formatHistoryDate = (isoString: string) => {
  if (!isoString) return ''
  const date = dayjs(isoString)
  
  if (date.isToday()) {
    return 'Hoy'
  } else if (date.isYesterday()) {
    return 'Ayer'
  } else {
    return date.fromNow()
  }
}

const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return ''
  const diff = dayjs(end).diff(dayjs(start), 'minute')
  
  if (diff >= 60) {
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours}h ${minutes}m`
  }
  return `${diff}m`
}

const goToHistoryDetail = (sessionId: string) => {
  router.push(`/history/${sessionId}`)
}
</script>

<style scoped>
.text-white {
  color: white;
}

.btn-hero {
  font-size: 1.1rem;
  padding: var(--spacing-lg);
}

.btn-hero svg {
  flex-shrink: 0;
}

/* Workout Cards */
.workout-card {
  padding: var(--spacing-md) var(--spacing-lg);
}

.workout-info {
  flex: 1;
  min-width: 0;
}

.workout-name {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.workout-meta {
  margin: 0;
  font-size: 0.875rem;
}

.workout-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}


/* History Cards */
.history-card {
  padding: var(--spacing-md) var(--spacing-lg);
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-name {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.history-meta {
  margin: 0;
  font-size: 0.85rem;
}

.w-full {
    width: 100%;
}

.p-3 {
  padding: 0.75rem;
}

.font-bold {
  font-weight: 700;
}

.text-sm {
  font-size: 0.875rem;
}

.mr-2 {
    margin-right: 0.5rem;
}

.divider {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
}

.divider::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background-color: var(--color-border);
    z-index: 1;
}

.divider-text {
    background-color: var(--color-surface);
    padding: 0 var(--spacing-sm);
    z-index: 2;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    text-transform: uppercase;
    font-weight: 600;
}
</style>
