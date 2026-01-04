<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section mb-8">
      <h1 class="mb-4">Tu Gym <span class="text-white">Tracker</span></h1>
      
      <div class="card">
        <button v-if="activeSession" class="btn btn-primary btn-hero mb-4" @click="resumeWorkout">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          Resumir Entreno
        </button>

        <button class="btn btn-primary btn-hero mb-4" @click="startEmptyWorkout">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Entrenar Ahora
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
              <!-- More Options Menu -->
              <div class="options-menu-container">
                <button
                  class="btn-icon"
                  @click.stop="toggleOptionsMenu(workout.id)"
                  title="Más opciones"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                  </svg>
                </button>

                <div v-if="openMenuId === workout.id" class="options-menu card">
                  <button
                    class="btn-menu-item"
                    @click.stop="shareWorkout(workout.id)"
                  >
                    Compartir
                  </button>
                  <button
                    class="btn-menu-item"
                    @click.stop="editWorkout(workout.id)"
                  >
                    Editar
                  </button>
                  <button
                    class="btn-menu-item danger"
                    @click.stop="confirmDeleteWorkout(workout.id)"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- History Section -->
    <section>
      <div class="section-header">
        <h2 class="h3">Historial Reciente</h2>
        <span class="exercise-badge" v-if="history.length > 0">{{ history.length }}</span>
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
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.locale('es')
dayjs.extend(isToday)
dayjs.extend(isYesterday)

const { workouts, activeSession, startSession, shareWorkout } = useWorkouts()
const router = useRouter()

const resumeWorkout = () => {
  if (activeSession.value) {
    router.push(`/session/${activeSession.value.id}`)
  }
}

// Overwrite confirmation logic
const showOverwriteModal = ref(false)
const nextWorkoutId = ref<string | null>(null)
const isStartingEmpty = ref(false)

const startEmptyWorkout = () => {
  if (activeSession.value) {
    isStartingEmpty.value = true
    nextWorkoutId.value = null
    showOverwriteModal.value = true
  } else {
    const sessionId = startSession()
    router.push(`/session/${sessionId}`)
  }
}

const startWorkout = (workoutId: string) => {
  if (activeSession.value) {
    isStartingEmpty.value = false
    nextWorkoutId.value = workoutId
    showOverwriteModal.value = true
  } else {
    const sessionId = startSession(workoutId)
    router.push(`/session/${sessionId}`)
  }
}

const handleOverwriteConfirm = () => {
  const workoutId = isStartingEmpty.value ? undefined : nextWorkoutId.value ?? undefined
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

// Deletion Logic
const { history, deleteSession, deleteWorkout } = useWorkouts()
const showDeleteModal = ref(false)
const openMenuId = ref<string | null>(null)
const sessionToDelete = ref<string | null>(null)
const workoutToDelete = ref<string | null>(null)
const deleteType = ref<'history' | 'workout'>('history')
const modalTitle = ref('')
const modalMessage = ref('')

const confirmDelete = (sessionId: string) => {
  sessionToDelete.value = sessionId
  deleteType.value = 'history'
  modalTitle.value = '¿Eliminar historial?'
  modalMessage.value = 'Se eliminará este registro de entrenamiento.'
  showDeleteModal.value = true
}

const toggleOptionsMenu = (workoutId: string) => {
  if (openMenuId.value === workoutId) {
    openMenuId.value = null
  } else {
    openMenuId.value = workoutId
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.options-menu-container')) {
    openMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const confirmDeleteWorkout = (workoutId: string) => {
  openMenuId.value = null // Close menu
  workoutToDelete.value = workoutId
  deleteType.value = 'workout'
  modalTitle.value = '¿Eliminar rutina?'
  modalMessage.value = 'Se eliminará la rutina y sus ejercicios configurados.'
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
  const time = date.format('HH:mm')
  
  if (date.isToday()) {
    return `Hoy, ${time}`
  } else if (date.isYesterday()) {
    return `Ayer, ${time}`
  } else {
    return `${date.format('D MMM')}, ${time}`
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

.options-menu-container {
  position: relative;
}

.options-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-xs);
  padding: var(--spacing-xs);
  min-width: 120px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.btn-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background-color: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
  text-align: left;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-menu-item:hover {
  background-color: var(--color-background-muted);
}

.btn-menu-item.danger {
  color: var(--color-danger);
}

.btn-menu-item.danger:hover {
  background-color: var(--color-danger-muted);
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
</style>
